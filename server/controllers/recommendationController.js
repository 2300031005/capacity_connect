const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Competency = require('../models/Competency');
const {
  generateCourseRecommendations,
  generateSkillGuidance,
  generateCourseRationale,
  checkRateLimit,
} = require('../services/openaiService');

// In-memory recommendations cache: [traineeId] -> { data, timestamp }
const recommendationsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Helper to compute trainee's verified skills and completion map
 */
const computeTraineeSkillsAndGaps = async (traineeId) => {
  // 1. Fetch enrollments
  const enrollments = await Enrollment.find({
    trainee: traineeId,
    status: { $in: ['active', 'completed'] },
  }).populate({
    path: 'course',
    select: 'title category level status skills',
    populate: { path: 'skills.skill', select: 'name category description isActive' },
  });

  const enrolledCourseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

  // 2. Published final assessments & passed attempts
  const [publishedFinalAssessments, passedAttempts, certificates] = await Promise.all([
    Assessment.find({
      course: { $in: enrolledCourseIds },
      type: 'final',
      status: 'published',
    }).select('course'),
    QuizAttempt.find({
      trainee: traineeId,
      course: { $in: enrolledCourseIds },
      type: 'final',
      passed: true,
    }),
    Certificate.find({
      trainee: traineeId,
      course: { $in: enrolledCourseIds },
      status: 'valid',
    }),
  ]);

  const coursesWithFinalAssessment = new Set(
    publishedFinalAssessments.map((a) => a.course.toString())
  );

  const coursesWithPassedFinal = new Set([
    ...passedAttempts.map((a) => a.course.toString()),
    ...certificates.map((c) => c.course.toString()),
  ]);

  const completedCourseIds = [];
  const activeCourseIds = [];
  const verifiedSkillMap = new Map();
  const learningSkillMap = new Map();

  enrollments.forEach((enr) => {
    const course = enr.course;
    if (!course) return;
    const cIdStr = course._id.toString();
    const hasFinal = coursesWithFinalAssessment.has(cIdStr);
    const passedFinal = coursesWithPassedFinal.has(cIdStr);

    const isCompleted = hasFinal
      ? passedFinal
      : enr.status === 'completed' && enr.progress === 100;

    if (isCompleted) {
      completedCourseIds.push(course._id);
    } else {
      activeCourseIds.push(course._id);
    }

    // Process skills
    if (Array.isArray(course.skills)) {
      course.skills.forEach((rawSkill) => {
        let skillName = rawSkill.name;
        let skillId = rawSkill._id;
        let prof = rawSkill.proficiency || 'proficient';

        if (rawSkill.skill && typeof rawSkill.skill === 'object') {
          skillName = rawSkill.skill.name;
          skillId = rawSkill.skill._id;
        }

        if (!skillName) return;

        if (isCompleted) {
          verifiedSkillMap.set(skillName.toLowerCase(), {
            name: skillName,
            highestProficiency: prof,
            category: course.category,
          });
        } else {
          learningSkillMap.set(skillName.toLowerCase(), {
            name: skillName,
            targetProficiency: prof,
            courseTitle: course.title,
            progress: enr.progress || 0,
          });
        }
      });
    }
  });

  // 3. Assessment performance metrics
  const allAttempts = await QuizAttempt.find({ trainee: traineeId })
    .populate('course', 'title category')
    .sort({ submittedAt: -1 })
    .limit(10);

  const totalAttempts = allAttempts.length;
  const passedCount = allAttempts.filter((a) => a.passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(allAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts)
    : 0;

  const weakAttempts = allAttempts.filter((a) => a.percentage < 70);
  const weakAreas = weakAttempts.map((a) => a.course?.category || 'General').filter(Boolean);

  // 4. Incomplete Competencies
  const allCompetencies = await Competency.find({ isActive: true }).populate('skills', 'name category');
  const verifiedNames = new Set(Array.from(verifiedSkillMap.keys()));

  const competenciesContext = allCompetencies.map((comp) => {
    const totalRequired = comp.skills ? comp.skills.length : 0;
    const missingSkills = [];
    let satisfied = 0;

    (comp.skills || []).forEach((s) => {
      if (verifiedNames.has(s.name.toLowerCase())) {
        satisfied++;
      } else {
        missingSkills.push(s.name);
      }
    });

    const pct = totalRequired > 0 ? Math.round((satisfied / totalRequired) * 100) : 0;
    const status = pct === 100 ? 'Demonstrated' : pct > 0 ? 'In Progress' : 'Not Started';

    return {
      name: comp.name,
      demonstratedPercentage: pct,
      status,
      missingSkills,
    };
  }).filter((c) => c.status !== 'Demonstrated');

  return {
    completedCourseIds,
    activeCourseIds,
    verifiedSkills: Array.from(verifiedSkillMap.values()),
    learningSkills: Array.from(learningSkillMap.values()),
    assessmentSummary: {
      totalAttempts,
      passRate: totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0,
      avgScore,
      weakAreas: [...new Set(weakAreas)],
    },
    competencies: competenciesContext,
  };
};

/**
 * @desc    Get centralized AI Recommendation Hub data (Courses, Skills to Develop, Assessment Insights, Next Steps)
 * @route   GET /api/ai/recommendations
 * @access  Private / Trainee
 */
const getCourseRecommendations = async (req, res, next) => {
  try {
    const traineeId = req.user._id;
    const traineeIdStr = traineeId.toString();
    const isRefreshRequested = req.query.refresh === 'true' || req.method === 'POST';

    // 1. Check in-memory cache if not explicitly refreshing
    if (!isRefreshRequested && recommendationsCache.has(traineeIdStr)) {
      const cachedEntry = recommendationsCache.get(traineeIdStr);
      if (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          success: true,
          count: cachedEntry.recommendations.length,
          data: {
            recommendations: cachedEntry.recommendations,
            skillsToDevelop: cachedEntry.skillsToDevelop || [],
            assessmentInsights: cachedEntry.assessmentInsights || [],
            nextSteps: cachedEntry.nextSteps || [],
            traineeSummary: cachedEntry.traineeSummary,
            cached: true,
            generatedAt: new Date(cachedEntry.timestamp),
          },
        });
      }
    }

    // 2. Enforce rolling window rate limit
    const rateCheck = checkRateLimit(traineeIdStr);
    if (!rateCheck.allowed) {
      if (recommendationsCache.has(traineeIdStr)) {
        const cachedEntry = recommendationsCache.get(traineeIdStr);
        return res.status(200).json({
          success: true,
          count: cachedEntry.recommendations.length,
          data: {
            recommendations: cachedEntry.recommendations,
            skillsToDevelop: cachedEntry.skillsToDevelop || [],
            assessmentInsights: cachedEntry.assessmentInsights || [],
            nextSteps: cachedEntry.nextSteps || [],
            traineeSummary: cachedEntry.traineeSummary,
            cached: true,
            rateLimitWarning: true,
            generatedAt: new Date(cachedEntry.timestamp),
          },
        });
      }

      return res.status(429).json({
        success: false,
        message: 'Rate limit reached for AI recommendations. Please wait a moment.',
      });
    }

    // 3. Gather Trainee Learning Context
    const traineeContext = await computeTraineeSkillsAndGaps(traineeId);

    // 4. Retrieve Candidate Published Courses
    const candidateCourses = await Course.find({
      status: 'published',
      _id: { $nin: traineeContext.completedCourseIds },
    })
      .populate('trainer', 'name department')
      .populate('skills.skill', 'name category description')
      .lean();

    const traineeSummary = {
      verifiedSkillsCount: traineeContext.verifiedSkills.length,
      completedCoursesCount: traineeContext.completedCourseIds.length,
      activeCoursesCount: traineeContext.activeCourseIds.length,
      inProgressCompetenciesCount: traineeContext.competencies.length,
    };

    if (!candidateCourses || candidateCourses.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: {
          recommendations: [],
          skillsToDevelop: [],
          assessmentInsights: [
            {
              type: 'onboarding',
              title: 'Learning Trajectory Up to Date',
              description: 'You have explored all published courses available. Check back soon for new offerings!',
              status: 'neutral',
            },
          ],
          nextSteps: [
            {
              step: 1,
              title: 'Review Verified Skills',
              description: 'Inspect your verified skill credentials on your transcript.',
              actionUrl: '/trainee/skills',
            },
          ],
          traineeSummary,
          cached: false,
          generatedAt: new Date(),
        },
      });
    }

    // 5. Invoke OpenAI Recommendation Hub Engine
    const aiResult = await generateCourseRecommendations({
      traineeContext: {
        verifiedSkills: traineeContext.verifiedSkills,
        learningSkills: traineeContext.learningSkills,
        competencies: traineeContext.competencies,
        assessmentSummary: traineeContext.assessmentSummary,
        completedCoursesCount: traineeContext.completedCourseIds.length,
      },
      candidateCourses,
    });

    // 6. Enrich AI Recommendations with database Course models
    const candidateMap = new Map();
    candidateCourses.forEach((c) => {
      candidateMap.set(c._id.toString(), c);
    });

    const enrichedRecommendations = (aiResult.recommendations || [])
      .map((rec) => {
        const courseDoc = candidateMap.get(String(rec.courseId));
        if (!courseDoc) return null;

        return {
          courseId: courseDoc._id,
          course: {
            _id: courseDoc._id,
            title: courseDoc.title,
            description: courseDoc.description,
            thumbnail: courseDoc.thumbnail,
            category: courseDoc.category,
            level: courseDoc.level,
            trainer: courseDoc.trainer,
            averageRating: courseDoc.averageRating || 0,
            skills: (courseDoc.skills || []).map((s) => ({
              _id: s.skill?._id || s._id,
              name: s.skill?.name || s.name || 'Skill',
              category: s.skill?.category || s.category || 'Technical',
              proficiency: s.proficiency || 'proficient',
            })),
          },
          matchScore: rec.matchScore || 85,
          reason: rec.reason || `Directly aligns with your current learning goals and builds proficiency.`,
          skillAlignment: Array.isArray(rec.skillAlignment) ? rec.skillAlignment : [],
          learningBenefit: rec.learningBenefit || `Helps bridge competency gaps and advance verified skills.`,
          priority: rec.priority || 'medium',
        };
      })
      .filter(Boolean);

    const fullHubData = {
      recommendations: enrichedRecommendations,
      skillsToDevelop: aiResult.skillsToDevelop || [],
      assessmentInsights: aiResult.assessmentInsights || [],
      nextSteps: aiResult.nextSteps || [],
      traineeSummary,
      timestamp: Date.now(),
    };

    // 7. Store in in-memory cache
    recommendationsCache.set(traineeIdStr, fullHubData);

    return res.status(200).json({
      success: true,
      count: enrichedRecommendations.length,
      data: {
        ...fullHubData,
        cached: false,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get contextual AI skill progression guidance
 * @route   GET /api/ai/skills/:skillName/guidance
 * @access  Private / Trainee
 */
const getSkillGuidance = async (req, res, next) => {
  try {
    const traineeId = req.user._id;
    const { skillName } = req.params;

    if (!skillName) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const rateCheck = checkRateLimit(traineeId.toString());
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: 'AI advisor rate limit reached. Please wait a moment.' });
    }

    const traineeContext = await computeTraineeSkillsAndGaps(traineeId);

    // Find current verified or learning proficiency
    const verifiedSkill = traineeContext.verifiedSkills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());
    const learningSkill = traineeContext.learningSkills.find((s) => s.name.toLowerCase() === skillName.toLowerCase());

    const currentProficiency = verifiedSkill ? verifiedSkill.highestProficiency : (learningSkill ? 'learning' : 'Not Acquired');
    const targetProficiency = currentProficiency === 'beginner' ? 'Proficient' : (currentProficiency === 'proficient' ? 'Advanced' : 'Proficient');

    // Find published platform courses teaching this skill
    const mappedCourses = await Course.find({
      status: 'published',
      $or: [
        { 'skills.name': { $regex: new RegExp(`^${skillName}$`, 'i') } },
        { category: { $regex: new RegExp(skillName, 'i') } },
      ],
    })
      .select('title category level skills averageRating')
      .limit(3)
      .lean();

    const guidance = await generateSkillGuidance({
      traineeContext,
      skillName,
      currentProficiency,
      targetProficiency,
      mappedCourses,
    });

    return res.status(200).json({
      success: true,
      data: guidance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get contextual AI course recommendation rationale
 * @route   GET /api/ai/courses/:courseId/rationale
 * @access  Private / Trainee
 */
const getCourseRationale = async (req, res, next) => {
  try {
    const traineeId = req.user._id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('trainer', 'name department')
      .populate('skills.skill', 'name category')
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const rateCheck = checkRateLimit(traineeId.toString());
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: 'AI advisor rate limit reached. Please wait a moment.' });
    }

    const traineeContext = await computeTraineeSkillsAndGaps(traineeId);

    const rationale = await generateCourseRationale({
      traineeContext,
      course,
    });

    return res.status(200).json({
      success: true,
      data: rationale,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseRecommendations,
  getSkillGuidance,
  getCourseRationale,
  computeTraineeSkillsAndGaps,
};
