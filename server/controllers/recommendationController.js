const User = require('../models/User');
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
  generateLearningPath,
  generateCareerRoadmap,
  generateFallbackCareerRoadmap,
  generateAdaptiveAdvisor,
  generateFallbackAdaptiveAdvisor,
  checkRateLimit,
} = require('../services/openaiService');

// In-memory recommendations cache: [traineeId] -> { data, timestamp }
const recommendationsCache = new Map();
const learningPathCache = new Map();
const careerRoadmapCache = new Map();
const adaptiveAdvisorCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Invalidate all AI caches for a specific trainee upon learning events
 */
const invalidateTraineeAICache = (traineeId) => {
  if (!traineeId) return;
  const idStr = traineeId.toString();
  recommendationsCache.delete(idStr);
  learningPathCache.delete(idStr);
  careerRoadmapCache.delete(idStr);
  adaptiveAdvisorCache.delete(idStr);
};

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

/**
 * @desc    Get AI-Powered Personalized Learning Path
 * @route   GET /api/ai/learning-path
 * @access  Private / Trainee
 */
const getPersonalizedLearningPath = async (req, res, next) => {
  try {
    const traineeId = req.user._id;
    const forceRefresh = req.query.refresh === 'true' || req.method === 'POST';

    // 1. Check in-memory cache
    if (!forceRefresh) {
      const cached = learningPathCache.get(traineeId.toString());
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          success: true,
          data: {
            ...cached.data,
            cached: true,
          },
        });
      }
    }

    // 2. Abuse rate protection
    const rateCheck = checkRateLimit(traineeId.toString());
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'AI advisor rate limit reached. Please wait a moment before requesting learning path updates.',
      });
    }

    // 3. Extract Trainee Context
    const traineeContext = await computeTraineeSkillsAndGaps(traineeId);

    // 4. Gather Active Enrollments with Progress
    const activeEnrollments = await Enrollment.find({
      trainee: traineeId,
      status: 'active',
    }).populate({
      path: 'course',
      select: 'title category level status skills averageRating trainer',
      populate: [
        { path: 'trainer', select: 'name' },
        { path: 'skills.skill', select: 'name category' },
      ],
    }).lean();

    const activeCourses = activeEnrollments
      .filter((e) => e.course && e.course.status === 'published')
      .map((e) => ({
        _id: e.course._id,
        courseId: e.course._id,
        title: e.course.title,
        category: e.course.category,
        level: e.course.level,
        progress: e.progress || 0,
        skills: (e.course.skills || []).map((s) => ({
          name: s.name || s.skill?.name || '',
          proficiency: s.proficiency || 'proficient',
        })),
        trainer: e.course.trainer,
      }));

    // 5. Gather Candidate Published Courses (Excluding Completed Courses)
    const candidateCourses = await Course.find({
      status: 'published',
      _id: { $nin: traineeContext.completedCourseIds },
    })
      .populate('trainer', 'name department')
      .populate('skills.skill', 'name category')
      .lean();

    // 6. Generate Learning Path
    const rawPath = await generateLearningPath({
      traineeContext,
      candidateCourses,
      activeCourses,
      completedCourses: traineeContext.completedCourseIds,
    });

    // 7. Validate and Populate Course Data
    const courseMap = new Map();
    candidateCourses.forEach((c) => courseMap.set(c._id.toString(), c));
    activeCourses.forEach((c) => courseMap.set(c._id.toString(), c));

    const activeCourseIdSet = new Set(activeCourses.map((c) => c._id.toString()));

    const validatedSteps = (rawPath.steps || []).map((step, idx) => {
      const course = courseMap.get(step.courseId.toString());
      const isActive = activeCourseIdSet.has(step.courseId.toString());
      let finalStatus = step.status || 'recommended';
      if (isActive) {
        finalStatus = 'current';
      } else if (finalStatus === 'current') {
        finalStatus = 'recommended';
      }

      return {
        sequence: idx + 1,
        courseId: step.courseId,
        title: step.title || course?.title || 'Course Step',
        category: course?.category || 'General',
        level: course?.level || 'Intermediate',
        trainer: course?.trainer?.name || 'Faculty',
        status: finalStatus,
        progress: isActive && course?.progress !== undefined ? course.progress : (finalStatus === 'completed' ? 100 : 0),
        skills: Array.isArray(step.skills) && step.skills.length > 0
          ? step.skills
          : (course?.skills || []).map((s) => ({
              name: s.name || s.skill?.name || 'Skill',
              currentProficiency: 'Beginner',
              targetProficiency: s.proficiency || 'Proficient',
            })),
        priority: step.priority || 'medium',
        reason: step.reason || 'Logically ordered for optimal prerequisite and competency advancement.',
        actionUrl: `/trainee/courses/${step.courseId}`,
      };
    });

    // 8. Calculate Database-Authoritative Learning Path Metrics
    const totalSteps = validatedSteps.length;
    const completedCount = validatedSteps.filter((s) => s.status === 'completed').length;
    const currentCount = validatedSteps.filter((s) => s.status === 'current').length;
    const remainingCount = validatedSteps.filter((s) => s.status === 'recommended' || s.status === 'next' || s.status === 'locked').length;

    let overallProgressPercentage = 0;
    if (totalSteps > 0) {
      const completedWeight = completedCount * 100;
      const currentWeight = validatedSteps
        .filter((s) => s.status === 'current')
        .reduce((sum, s) => sum + (s.progress || 0), 0);
      overallProgressPercentage = Math.round((completedWeight + currentWeight) / totalSteps);
    }

    const payload = {
      goal: rawPath.goal || 'Master Core Technical & Institutional Competencies',
      summary: rawPath.summary || 'A sequenced learning journey aligned with your verified progress, assessment diagnostics, and institutional milestones.',
      steps: validatedSteps,
      metrics: {
        totalSteps,
        completedCount,
        currentCount,
        remainingCount,
        progressPercentage: overallProgressPercentage,
      },
      cached: false,
    };

    // Cache the result
    learningPathCache.set(traineeId.toString(), {
      data: payload,
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Trainee Career Goal
 * @route   GET /api/ai/career-goal
 * @access  Private / Trainee
 */
const getCareerGoal = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('careerGoal name');
    return res.status(200).json({
      success: true,
      data: {
        careerGoal: user?.careerGoal || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update Trainee Career Goal
 * @route   POST /api/ai/career-goal
 * @access  Private / Trainee
 */
const setCareerGoal = async (req, res, next) => {
  try {
    const { careerGoal } = req.body;
    if (typeof careerGoal !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid career goal string' });
    }

    const trimmedGoal = careerGoal.trim();
    await User.findByIdAndUpdate(req.user._id, { careerGoal: trimmedGoal });

    // Invalidate career roadmap cache for this trainee
    careerRoadmapCache.delete(req.user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        careerGoal: trimmedGoal,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI-Powered Career Goal Learning Roadmap
 * @route   GET /api/ai/career-roadmap, POST /api/ai/career-roadmap/refresh
 * @access  Private / Trainee
 */
const getCareerRoadmap = async (req, res, next) => {
  try {
    const traineeId = req.user._id;
    const forceRefresh = req.query.refresh === 'true' || req.method === 'POST';

    // 1. Determine career goal
    let goal = req.body?.careerGoal || req.query?.goal;
    if (!goal) {
      const user = await User.findById(traineeId).select('careerGoal');
      goal = user?.careerGoal || '';
    }

    // If goal is empty, return empty roadmap prompt state
    if (!goal || !goal.trim()) {
      return res.status(200).json({
        success: true,
        data: {
          careerGoal: '',
          targetCompetency: '',
          summary: 'Tell us what you want to become and we will build a personalized learning roadmap.',
          skillGaps: [],
          stages: [],
          metrics: {
            totalStages: 0,
            completedStages: 0,
            currentStages: 0,
            remainingStages: 0,
            progressPercentage: 0,
          },
          cached: false,
        },
      });
    }

    const cleanGoal = goal.trim();

    // 2. Check in-memory cache
    if (!forceRefresh) {
      const cached = careerRoadmapCache.get(traineeId.toString());
      if (
        cached &&
        cached.data?.careerGoal?.toLowerCase() === cleanGoal.toLowerCase() &&
        Date.now() - cached.timestamp < CACHE_TTL_MS
      ) {
        return res.status(200).json({
          success: true,
          data: {
            ...cached.data,
            cached: true,
          },
        });
      }
    }

    // 3. Abuse rate limiter
    const rateCheck = checkRateLimit(traineeId.toString());
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'AI advisor rate limit reached. Please wait a moment before requesting career roadmap updates.',
      });
    }

    // 4. Extract Trainee Context
    const traineeContext = await computeTraineeSkillsAndGaps(traineeId);

    // 5. Gather Active Enrollments & Completed IDs
    const activeEnrollments = await Enrollment.find({
      trainee: traineeId,
      status: 'active',
    }).populate({
      path: 'course',
      select: 'title category level status skills averageRating trainer',
      populate: [
        { path: 'trainer', select: 'name' },
        { path: 'skills.skill', select: 'name category' },
      ],
    }).lean();

    const activeCourses = activeEnrollments
      .filter((e) => e.course && e.course.status === 'published')
      .map((e) => ({
        _id: e.course._id,
        courseId: e.course._id,
        title: e.course.title,
        category: e.course.category,
        level: e.course.level,
        progress: e.progress || 0,
        skills: (e.course.skills || []).map((s) => ({
          name: s.name || s.skill?.name || '',
          skillId: s.skill?._id?.toString() || (typeof s.skill === 'string' ? s.skill : ''),
          proficiency: s.proficiency || 'proficient',
        })),
        trainer: e.course.trainer,
      }));

    // 6. Gather Platform Taxonomies (Skills, Competencies, All Published Courses)
    const [allPublishedCourses, availableSkills, availableCompetencies] = await Promise.all([
      Course.find({ status: 'published' })
        .populate('trainer', 'name department')
        .populate('skills.skill', 'name category')
        .lean(),
      Skill.find({ isActive: true }).select('name category').lean(),
      Competency.find({ isActive: true }).populate('skills', 'name category').lean(),
    ]);

    // 7. Generate Structured Skills Sequence via AI / Fallback
    const rawRoadmap = await generateCareerRoadmap({
      careerGoal: cleanGoal,
      traineeContext,
      availableSkills,
      availableCompetencies,
      activeCourses,
      completedCourses: traineeContext.completedCourseIds,
    });

    // 8. Map Verified Skills & Active Course Sets
    const normalizeSkill = (str) => (str || '').replace(/\[.*?\]/g, '').toLowerCase().trim();

    const completedCourseIdSet = new Set((traineeContext.completedCourseIds || []).map((id) => id.toString()));
    const verifiedSkillsMap = new Map();
    (traineeContext.verifiedSkills || []).forEach((s) => {
      const sName = s.name || s;
      verifiedSkillsMap.set(normalizeSkill(sName), (s.highestProficiency || 'proficient').toLowerCase());
    });

    const rawSteps = Array.isArray(rawRoadmap.steps)
      ? rawRoadmap.steps
      : (Array.isArray(rawRoadmap.stages) ? rawRoadmap.stages : []);

    // 9. Match each ordered skill against MongoDB Course.skills
    const matchedSteps = rawSteps.map((st, idx) => {
      const rawSkillName = st.skill || st.skillName || `Skill ${idx + 1}`;
      const rawNorm = normalizeSkill(rawSkillName);

      // Find matching standard skill document from platform library
      const matchedSkillDoc = availableSkills.find((s) => {
        const sNorm = normalizeSkill(s.name);
        return sNorm === rawNorm || (rawNorm.length > 2 && (sNorm.includes(rawNorm) || rawNorm.includes(sNorm)));
      });

      const canonicalSkillName = matchedSkillDoc ? matchedSkillDoc.name : rawSkillName;
      const canonicalNorm = normalizeSkill(canonicalSkillName);

      // Determine Trainee Status & Proficiency for this skill
      const verifiedProf = verifiedSkillsMap.get(canonicalNorm) || verifiedSkillsMap.get(rawNorm);
      const isDemonstrated = Boolean(verifiedProf);

      // Check active enrollment in course mapped to this skill via Course.skills
      const activeMatch = activeCourses.find((c) => {
        return (c.skills || []).some((s) => {
          const sNorm = normalizeSkill(s.name);
          if (matchedSkillDoc && s.skillId && s.skillId === matchedSkillDoc._id.toString()) return true;
          return sNorm === canonicalNorm || sNorm === rawNorm;
        });
      });

      const isCurrent = !isDemonstrated && Boolean(activeMatch);
      const isNotStarted = !isDemonstrated && !isCurrent;

      let currentProficiency = 'Not Earned';
      let statusLabel = 'Not Started';
      if (isDemonstrated) {
        currentProficiency = verifiedProf.charAt(0).toUpperCase() + verifiedProf.slice(1);
        statusLabel = 'Already Demonstrated';
      } else if (isCurrent) {
        currentProficiency = 'Beginner';
        statusLabel = 'In Progress';
      }

      // Search real MongoDB courses mapped to this skill strictly via Course.skills
      const matchingPublishedCourses = allPublishedCourses.filter((c) => {
        return (c.skills || []).some((s) => {
          const skName = s.name || s.skill?.name || '';
          const skNorm = normalizeSkill(skName);
          const skId = (s.skill?._id || s.skill || '').toString();
          if (matchedSkillDoc && skId && skId === matchedSkillDoc._id.toString()) return true;
          return skNorm === canonicalNorm || skNorm === rawNorm;
        });
      });

      // Select matching course according to status priority
      let chosenCourse = null;
      if (isCurrent && activeMatch) {
        const fullActive = allPublishedCourses.find((c) => c._id.toString() === activeMatch._id.toString()) || activeMatch;
        chosenCourse = { ...fullActive, progress: activeMatch.progress, status: 'current' };
      } else if (isDemonstrated) {
        const completedMatch = matchingPublishedCourses.find((c) => completedCourseIdSet.has(c._id.toString())) || matchingPublishedCourses[0];
        if (completedMatch) {
          chosenCourse = { ...completedMatch, progress: 100, status: 'completed' };
        }
      } else {
        const nonCompletedCandidate = matchingPublishedCourses.find((c) => !completedCourseIdSet.has(c._id.toString())) || matchingPublishedCourses[0];
        if (nonCompletedCandidate) {
          chosenCourse = { ...nonCompletedCandidate, progress: 0, status: 'recommended' };
        }
      }

      const coursePayload = chosenCourse
        ? {
            id: chosenCourse._id.toString(),
            _id: chosenCourse._id.toString(),
            courseId: chosenCourse._id.toString(),
            title: chosenCourse.title,
            category: chosenCourse.category,
            level: chosenCourse.level,
            trainer: chosenCourse.trainer?.name || 'Faculty',
            progress: chosenCourse.progress !== undefined ? chosenCourse.progress : 0,
            status: chosenCourse.status || (isDemonstrated ? 'completed' : isCurrent ? 'current' : 'recommended'),
            averageRating: chosenCourse.averageRating || 4.8,
          }
        : null;

      const statusCode = isDemonstrated ? 'completed' : isCurrent ? 'current' : (coursePayload ? 'next' : 'unavailable');

      return {
        order: idx + 1,
        sequence: idx + 1,
        skill: canonicalSkillName,
        skillName: canonicalSkillName,
        reason: st.reason || `Essential capability for achieving your target as a ${cleanGoal}.`,
        currentProficiency,
        targetProficiency: st.targetProficiency || 'Proficient',
        status: statusLabel, // "Already Demonstrated" | "In Progress" | "Not Started"
        statusCode,
        course: coursePayload,
        courseAvailable: Boolean(coursePayload),
        unavailableMessage: coursePayload ? null : 'Capacity Connect currently has no published course mapped to this skill.',
        isDemonstrated,
        isCurrent,
        isNotStarted,
        // Compatibility properties for stages consumers:
        title: canonicalSkillName,
        priority: isCurrent ? 'high' : 'medium',
        courses: coursePayload ? [coursePayload] : [],
        isUnavailable: !coursePayload,
      };
    });

    // 10. Compute Skill Gap Breakdown
    const skillGaps = matchedSteps.map((st) => ({
      skillName: st.skill,
      requiredProficiency: st.targetProficiency,
      currentProficiency: st.currentProficiency,
      status: st.isDemonstrated ? 'demonstrated' : (st.isCurrent ? 'in_progress' : 'missing'),
      reason: st.reason,
    }));

    // 11. Calculate Database-Authoritative Metrics
    const totalStages = matchedSteps.length;
    const completedStages = matchedSteps.filter((s) => s.isDemonstrated).length;
    const currentStages = matchedSteps.filter((s) => s.isCurrent).length;
    const remainingStages = matchedSteps.filter((s) => s.isNotStarted).length;

    let overallProgressPercentage = 0;
    if (totalStages > 0) {
      const completedWeight = completedStages * 100;
      const currentWeight = matchedSteps
        .filter((s) => s.isCurrent)
        .reduce((sum, s) => sum + (s.course?.progress || 0), 0);
      overallProgressPercentage = Math.round((completedWeight + currentWeight) / totalStages);
    }

    const payload = {
      careerGoal: cleanGoal,
      targetCompetency: rawRoadmap.targetCompetency || 'Institutional Career Milestone Track',
      summary: rawRoadmap.summary || `A structured skill progression guiding you step-by-step toward becoming a ${cleanGoal}.`,
      steps: matchedSteps,
      stages: matchedSteps,
      skillGaps,
      metrics: {
        totalStages,
        totalSteps: totalStages,
        completedStages,
        demonstratedCount: completedStages,
        currentStages,
        inProgressCount: currentStages,
        remainingStages,
        notStartedCount: remainingStages,
        progressPercentage: overallProgressPercentage,
      },
      cached: false,
    };

    // Cache the result
    careerRoadmapCache.set(traineeId.toString(), {
      data: payload,
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Adaptive AI Learning Advisor Next Action & Insights (Phase 7.5)
 * @route   GET /api/recommendations/adaptive-advisor, POST /api/recommendations/adaptive-advisor/refresh
 * @access  Private / Trainee
 */
const getAdaptiveAdvisor = async (req, res, next) => {
  try {
    const traineeId = req.user._id;
    const forceRefresh = req.query.refresh === 'true' || req.method === 'POST';

    // 1. Check in-memory cache
    const traineeIdStr = traineeId.toString();
    if (!forceRefresh) {
      const cached = adaptiveAdvisorCache.get(traineeIdStr);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          success: true,
          data: {
            ...cached.data,
            cached: true,
          },
        });
      }
    }

    // 2. Rate limiter check
    const rateCheck = checkRateLimit(traineeIdStr);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: 'AI advisor rate limit reached. Please wait a moment before requesting learning insights.',
      });
    }

    // 3. Gather comprehensive real-time database context
    const user = await User.findById(traineeId).select('careerGoal name email department');
    const careerGoal = user?.careerGoal || 'Full Stack Developer';

    const traineeContext = await computeTraineeSkillsAndGaps(traineeId);

    // 4. Active & Completed Enrollments
    const activeEnrollments = await Enrollment.find({
      trainee: traineeId,
      status: 'active',
    })
      .populate({
        path: 'course',
        select: 'title category level status averageRating trainer skills',
        populate: [
          { path: 'trainer', select: 'name email' },
          { path: 'skills.skill', select: 'name category' },
        ],
      })
      .sort({ updatedAt: -1 });

    const activeCourses = activeEnrollments
      .map((enr) => {
        if (!enr.course) return null;
        return {
          _id: enr.course._id,
          id: enr.course._id,
          courseId: enr.course._id,
          title: enr.course.title,
          category: enr.course.category,
          level: enr.course.level,
          trainer: enr.course.trainer?.name || 'Faculty',
          progress: enr.progress || 0,
          status: 'current',
          skills: (enr.course.skills || []).map((s) => ({
            name: s.skill?.name || s.name || '',
            proficiency: s.proficiency || 'proficient',
          })),
        };
      })
      .filter(Boolean);

    // 5. Recent Assessments & Attempts
    const recentAttempts = await QuizAttempt.find({ trainee: traineeId })
      .populate('course', 'title category level')
      .populate('assessment', 'title type passingPercentage')
      .sort({ submittedAt: -1 })
      .limit(10);

    const latestAssessments = recentAttempts.map((att) => ({
      _id: att._id,
      attemptId: att._id,
      assessmentId: att.assessment?._id || att.assessment,
      title: att.assessment?.title || `${att.course?.title || 'Course'} Assessment`,
      courseTitle: att.course?.title || 'Course',
      courseId: att.course?._id || att.course,
      type: att.type,
      score: att.score,
      totalMarks: att.totalMarks,
      percentage: att.percentage,
      passed: att.passed,
      submittedAt: att.submittedAt,
    }));

    const completedCourseIdSet = new Set((traineeContext.completedCourseIds || []).map((id) => id.toString()));

    const latestAttemptByAssessment = new Map();
    recentAttempts.forEach((att) => {
      const aId = (att.assessment?._id || att.assessment || '').toString();
      if (aId && !latestAttemptByAssessment.has(aId)) {
        latestAttemptByAssessment.set(aId, att);
      }
    });

    const failedAssessments = latestAssessments.filter((att) => {
      if (att.courseId && completedCourseIdSet.has(att.courseId.toString())) {
        return false;
      }
      const latestForThis = latestAttemptByAssessment.get(att.assessmentId?.toString());
      if (latestForThis && latestForThis.passed) {
        return false;
      }
      return !att.passed || att.percentage < 70;
    });

    // 6. Platform Skills & Published Courses
    const [allPublishedCourses, availableSkills, availableCompetencies] = await Promise.all([
      Course.find({ status: 'published' })
        .populate('trainer', 'name email department')
        .populate('skills.skill', 'name category')
        .lean(),
      Skill.find({ isActive: true }).select('name category').lean(),
      Competency.find({ isActive: true }).populate('skills', 'name category').lean(),
    ]);

    // 7. Extract or synthesize roadmap context
    let roadmapSteps = [];
    const cachedRoadmap = careerRoadmapCache.get(traineeIdStr);
    if (cachedRoadmap && cachedRoadmap.data?.steps) {
      roadmapSteps = cachedRoadmap.data.steps;
    } else {
      const fallbackRoadmap = generateFallbackCareerRoadmap({
        careerGoal,
        traineeContext,
        availableSkills,
        availableCompetencies,
        activeCourses,
        completedCourses: traineeContext.completedCourseIds || [],
      });
      roadmapSteps = fallbackRoadmap.steps || [];
    }

    // 8. Call AI Adaptive Advisor (with fallback)
    const rawAdvice = await generateAdaptiveAdvisor({
      careerGoal,
      traineeContext,
      activeCourses,
      completedCourses: traineeContext.completedCourseIds || [],
      latestAssessments,
      failedAssessments,
      roadmapSteps,
      availableSkills,
      availableCompetencies,
    });

    // 9. Resolve skill & Authoritative Database Matching
    const normalize = (s) => (s || '').replace(/\[.*?\]/g, '').toLowerCase().trim();
    const actionSkillRaw = rawAdvice.nextAction?.skill || 'General Progress';
    const actionSkillNorm = normalize(actionSkillRaw);

    const matchedSkillDoc = availableSkills.find((s) => {
      const sNorm = normalize(s.name);
      return sNorm === actionSkillNorm || (actionSkillNorm.length > 2 && (sNorm.includes(actionSkillNorm) || actionSkillNorm.includes(sNorm)));
    });

    const canonicalSkillName = matchedSkillDoc ? matchedSkillDoc.name : actionSkillRaw;
    const canonicalNorm = normalize(canonicalSkillName);

    let resolvedCourse = null;
    let resolvedAssessment = null;
    const actionType = rawAdvice.nextAction?.type || 'start_course';

    if (actionType === 'continue_course' && activeCourses.length > 0) {
      resolvedCourse = activeCourses.find((c) => (c.progress || 0) < 100) || activeCourses[0];
    } else if (actionType === 'review_assessment' || actionType === 'retry_assessment') {
      if (failedAssessments.length > 0) {
        resolvedAssessment = failedAssessments[0];
        if (resolvedAssessment.courseId) {
          const linkedCourse = allPublishedCourses.find(
            (c) => c._id.toString() === resolvedAssessment.courseId.toString()
          );
          if (linkedCourse) {
            resolvedCourse = {
              id: linkedCourse._id.toString(),
              courseId: linkedCourse._id.toString(),
              _id: linkedCourse._id.toString(),
              title: linkedCourse.title,
              category: linkedCourse.category,
              level: linkedCourse.level,
              trainer: linkedCourse.trainer?.name || 'Faculty',
              status: 'review',
            };
          }
        }
      }
    }

    // If still no course resolved and not a 'no_action' state, search published courses strictly via Course.skills
    if (!resolvedCourse && actionType !== 'no_action') {
      const completedCourseIdSet = new Set((traineeContext.completedCourseIds || []).map((id) => id.toString()));

      const matchingPublishedCourses = allPublishedCourses.filter((c) => {
        return (c.skills || []).some((s) => {
          const skName = s.name || s.skill?.name || '';
          const skNorm = normalize(skName);
          const skId = (s.skill?._id || s.skill || '').toString();
          if (matchedSkillDoc && skId && skId === matchedSkillDoc._id.toString()) return true;
          return skNorm === canonicalNorm || skNorm === actionSkillNorm;
        });
      });

      const candidateCourse = matchingPublishedCourses.find((c) => !completedCourseIdSet.has(c._id.toString())) || matchingPublishedCourses[0];

      if (candidateCourse) {
        resolvedCourse = {
          id: candidateCourse._id.toString(),
          _id: candidateCourse._id.toString(),
          courseId: candidateCourse._id.toString(),
          title: candidateCourse.title,
          category: candidateCourse.category,
          level: candidateCourse.level,
          trainer: candidateCourse.trainer?.name || 'Faculty',
          progress: 0,
          status: 'recommended',
          averageRating: candidateCourse.averageRating || 4.8,
        };
      }
    }

    const courseAvailable = Boolean(resolvedCourse);
    const unavailableMessage = courseAvailable
      ? null
      : 'Capacity Connect currently has no published course mapped to this skill.';

    const payload = {
      careerGoal,
      nextAction: {
        type: actionType,
        title: rawAdvice.nextAction?.title || `Focus on ${canonicalSkillName}`,
        skill: canonicalSkillName,
        reason: rawAdvice.nextAction?.reason || `Advancing in ${canonicalSkillName} is the next step for your ${careerGoal} trajectory.`,
        priority: rawAdvice.nextAction?.priority || 'high',
        progress: resolvedCourse?.progress !== undefined ? resolvedCourse.progress : null,
        course: resolvedCourse,
        courseAvailable,
        unavailableMessage,
        assessment: resolvedAssessment,
      },
      insight: rawAdvice.insight || `Continuous learning analysis updated for your ${careerGoal} roadmap.`,
      focusArea: rawAdvice.focusArea || canonicalSkillName,
      urgency: rawAdvice.urgency || 'standard',
      traineeSummary: {
        verifiedSkillCount: (traineeContext.verifiedSkills || []).length,
        activeEnrollmentCount: activeCourses.length,
        completedCourseCount: (traineeContext.completedCourseIds || []).length,
        failedAssessmentCount: failedAssessments.length,
      },
      cached: false,
      timestamp: new Date().toISOString(),
    };

    adaptiveAdvisorCache.set(traineeIdStr, {
      data: payload,
      timestamp: Date.now(),
    });

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseRecommendations,
  getSkillGuidance,
  getCourseRationale,
  getPersonalizedLearningPath,
  getCareerGoal,
  setCareerGoal,
  getCareerRoadmap,
  getAdaptiveAdvisor,
  computeTraineeSkillsAndGaps,
  invalidateTraineeAICache,
};

