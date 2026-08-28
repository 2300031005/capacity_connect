/**
 * Capacity Connect — AI Trainer Teaching Assistant Controller (Phase 7.6)
 *
 * Provides portfolio-wide and course-specific pedagogical intelligence,
 * question difficulty analysis, module drop-off detection, skill mastery evaluation,
 * and actionable teaching suggestions for instructors.
 */

const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const {
  generateTrainerAiTeachingInsights,
  generateFallbackTrainerAiTeachingInsights,
  generateCourseSpecificAiInsights,
  generateFallbackCourseSpecificAiInsights,
} = require('../services/openaiService');

// In-memory cache for trainer AI insights: [trainerId] -> { data, timestamp }
const trainerAiCache = new Map();
const courseAiCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Invalidate trainer AI cache upon learning events (attempts, enrollments)
 */
const invalidateTrainerAiCache = (trainerId, courseId) => {
  if (trainerId) trainerAiCache.delete(trainerId.toString());
  if (courseId) courseAiCache.delete(courseId.toString());
};

/**
 * Helper: Extract question-level accuracy stats deterministically from quiz attempts
 */
const computeQuestionAccuracyStats = (quizAttempts) => {
  const questionMap = new Map();

  quizAttempts.forEach((attempt) => {
    const assessmentTitle = attempt.assessment?.title || 'Assessment';
    const courseTitle = attempt.course?.title || 'Course';
    const assessmentId = attempt.assessment?._id?.toString() || 'unknown';

    // Extract questions from attempt.answers or attempt.questionResults
    const answersList = Array.isArray(attempt.answers) ? attempt.answers : (Array.isArray(attempt.questions) ? attempt.questions : []);

    answersList.forEach((ans, qIdx) => {
      const qText = ans.questionText || (ans.question?.text) || (ans.text) || `Question ${qIdx + 1}`;
      const qKey = `${assessmentId}_${qIdx}_${qText.slice(0, 40)}`;

      if (!questionMap.has(qKey)) {
        questionMap.set(qKey, {
          assessmentId,
          assessmentTitle,
          courseTitle,
          questionIndex: qIdx + 1,
          questionText: qText,
          topic: qText.length > 60 ? `${qText.slice(0, 57)}...` : qText,
          totalAttempts: 0,
          incorrectCount: 0,
          correctCount: 0,
        });
      }

      const stat = questionMap.get(qKey);
      stat.totalAttempts += 1;
      if (ans.isCorrect === false) {
        stat.incorrectCount += 1;
      } else if (ans.isCorrect === true) {
        stat.correctCount += 1;
      }
    });
  });

  const list = Array.from(questionMap.values()).map((q) => {
    const accuracyPercentage = q.totalAttempts > 0
      ? Math.round((q.correctCount / q.totalAttempts) * 100)
      : (q.incorrectCount > 0 ? 0 : 100);

    return {
      ...q,
      accuracyPercentage,
    };
  });

  // Sort by lowest accuracy (highest difficulty) first
  list.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage);
  return list;
};

/**
 * Helper: Extract module drop-off statistics deterministically
 */
const computeModuleDropOffStats = (courses, modules, enrollments) => {
  const dropOffList = [];
  const moduleMap = new Map();

  modules.forEach((m) => {
    const cId = m.course?.toString();
    if (!moduleMap.has(cId)) moduleMap.set(cId, []);
    moduleMap.get(cId).push(m);
  });

  courses.forEach((course) => {
    const cId = course._id.toString();
    const courseModules = moduleMap.get(cId) || [];
    const courseEnrollments = enrollments.filter((e) => (e.course?._id?.toString() || e.course?.toString()) === cId);
    const totalEnrolled = courseEnrollments.length;

    if (totalEnrolled === 0 || courseModules.length === 0) return;

    courseModules.forEach((mod, idx) => {
      const modIdStr = mod._id.toString();
      const completedCount = courseEnrollments.filter((e) => {
        if (Array.isArray(e.completedModules) && e.completedModules.some((m) => m.toString() === modIdStr)) {
          return true;
        }
        if (e.status === 'completed' || e.progress === 100) return true;
        // Estimated completion by progress threshold
        const modThreshold = ((idx + 1) / courseModules.length) * 100;
        return (e.progress || 0) >= modThreshold;
      }).length;

      const completionPercentage = Math.round((completedCount / totalEnrolled) * 100);

      dropOffList.push({
        courseId: course._id,
        courseTitle: course.title,
        moduleId: mod._id,
        moduleTitle: mod.title,
        order: mod.order || (idx + 1),
        enrolledCount: totalEnrolled,
        completedCount,
        completionPercentage,
      });
    });
  });

  // Sort by lowest completion percentage
  dropOffList.sort((a, b) => a.completionPercentage - b.completionPercentage);
  return dropOffList;
};

/**
 * Helper: Extract skill difficulty statistics
 */
const computeSkillDifficultyStats = (courses, quizAttempts) => {
  const skillMap = new Map();

  courses.forEach((c) => {
    const rawSkills = c.skills || [];
    rawSkills.forEach((item) => {
      const s = item?.skill || item;
      if (!s) return;
      const sId = s._id?.toString() || s.toString();
      const sName = s.name || (typeof item === 'string' ? item : 'Domain Skill');
      const sCategory = s.category || c.category || 'Technical';

      if (!skillMap.has(sName)) {
        skillMap.set(sName, {
          skillId: sId,
          name: sName,
          category: sCategory,
          courseCount: 0,
          totalAttempts: 0,
          passedAttempts: 0,
          scores: [],
        });
      }

      const stat = skillMap.get(sName);
      stat.courseCount += 1;
    });
  });

  // Match course quiz attempts to calculate pass rates
  quizAttempts.forEach((att) => {
    const courseTitle = att.course?.title || '';
    skillMap.forEach((stat) => {
      stat.totalAttempts += 1;
      if (att.passed) stat.passedAttempts += 1;
      if (att.percentage !== undefined) stat.scores.push(att.percentage);
    });
  });

  return Array.from(skillMap.values()).map((s) => {
    const passRate = s.totalAttempts > 0
      ? Math.round((s.passedAttempts / s.totalAttempts) * 100)
      : (s.scores.length > 0 ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 75);

    const difficulty = passRate < 55 ? 'high' : passRate < 75 ? 'moderate' : 'demonstrated';

    return {
      skillId: s.skillId,
      name: s.name,
      category: s.category,
      courseCount: s.courseCount,
      passRate,
      difficulty,
    };
  });
};

/**
 * Helper: Identify learners needing additional support
 */
const computeLearnersNeedingSupport = (quizAttempts, enrollments) => {
  const learnerMap = new Map();

  quizAttempts.forEach((att) => {
    const tId = att.trainee?._id?.toString() || att.trainee?.toString();
    const tName = att.trainee?.name || 'Trainee Learner';
    const cTitle = att.course?.title || 'Course';

    if (!learnerMap.has(tId)) {
      learnerMap.set(tId, {
        traineeId: tId,
        traineeName: tName,
        courseTitle: cTitle,
        totalAttempts: 0,
        failedAttemptsCount: 0,
        scores: [],
        latestScore: att.percentage || 0,
        progress: 0,
      });
    }

    const rec = learnerMap.get(tId);
    rec.totalAttempts += 1;
    if (!att.passed) rec.failedAttemptsCount += 1;
    rec.scores.push(att.percentage || 0);
  });

  // Attach progress
  enrollments.forEach((e) => {
    const tId = e.trainee?._id?.toString() || e.trainee?.toString();
    if (learnerMap.has(tId)) {
      const rec = learnerMap.get(tId);
      rec.progress = Math.max(rec.progress, e.progress || 0);
    }
  });

  // Filter learners who have >= 2 failed attempts or avg score < 50%
  return Array.from(learnerMap.values())
    .filter((l) => l.failedAttemptsCount >= 1 || (l.scores.length > 0 && l.latestScore < 60))
    .sort((a, b) => b.failedAttemptsCount - a.failedAttemptsCount);
};

/**
 * @desc    Get Portfolio-wide AI Teaching Insights for Trainer
 * @route   GET /api/analytics/trainer/ai-teaching-insights
 * @route   POST /api/analytics/trainer/ai-teaching-insights/refresh
 * @access  Private / Trainer
 */
const getTrainerAiTeachingInsights = async (req, res, next) => {
  try {
    const trainerId = req.user._id;
    const isRefresh = req.query.refresh === 'true' || req.method === 'POST';
    const trainerIdStr = trainerId.toString();

    // 1. Check cache
    if (!isRefresh && trainerAiCache.has(trainerIdStr)) {
      const cached = trainerAiCache.get(trainerIdStr);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          success: true,
          data: {
            ...cached.data,
            cached: true,
          },
        });
      }
    }

    // 2. Query trainer's authorized courses (Strict Isolation)
    const courses = await Course.find({ trainer: trainerId })
      .populate('skills.skill', 'name category')
      .populate('skills', 'name category')
      .sort({ createdAt: -1 });

    const trainerContext = {
      id: trainerIdStr,
      name: req.user.name || 'Trainer',
      totalCourses: courses.length,
      totalLearners: 0,
    };

    if (courses.length === 0) {
      const emptyPayload = {
        summary: 'No courses found in your instructor portfolio. Create and publish courses with quizzes to generate automated AI Teaching Insights.',
        difficultyAreas: [],
        dropOffInsights: [],
        skillInsights: [],
        teachingSuggestions: [
          {
            type: 'create_course',
            title: 'Create and publish your first course',
            action: 'Build structured curriculum modules and interactive quizzes to start gathering learner analytics.',
            priority: 'high',
          },
        ],
        learnerSupport: [],
        metricsSummary: {
          totalCourses: 0,
          totalLearners: 0,
          evaluatedQuestionsCount: 0,
          dropOffDetectedCount: 0,
          strugglingLearnersCount: 0,
        },
        cached: false,
        timestamp: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        data: emptyPayload,
      });
    }

    const courseIds = courses.map((c) => c._id);

    // 3. Fetch all related records strictly bounded to trainer's course IDs
    const [enrollments, assessments, quizAttempts, modules] = await Promise.all([
      Enrollment.find({ course: { $in: courseIds } })
        .populate('trainee', 'name email')
        .populate('course', 'title category')
        .sort({ createdAt: -1 }),
      Assessment.find({ course: { $in: courseIds } }).populate('course', 'title'),
      QuizAttempt.find({ course: { $in: courseIds } })
        .populate('trainee', 'name email')
        .populate('course', 'title')
        .populate('assessment', 'title type')
        .sort({ submittedAt: -1 }),
      Module.find({ course: { $in: courseIds } }).sort({ order: 1 }),
    ]);

    trainerContext.totalLearners = new Set(enrollments.map((e) => e.trainee?._id?.toString() || e.trainee?.toString()).filter(Boolean)).size;

    // 4. Compute deterministic analytics metrics
    const questionStats = computeQuestionAccuracyStats(quizAttempts);
    const dropOffStats = computeModuleDropOffStats(courses, modules, enrollments);
    const skillStats = computeSkillDifficultyStats(courses, quizAttempts);
    const supportStats = computeLearnersNeedingSupport(quizAttempts, enrollments);

    // 5. Generate AI interpretation
    const aiResult = await generateTrainerAiTeachingInsights({
      trainerContext,
      courses,
      assessments,
      questionStats,
      dropOffStats,
      skillStats,
      supportStats,
      userId: trainerIdStr,
    });

    const payload = {
      ...aiResult,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    trainerAiCache.set(trainerIdStr, {
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
 * @desc    Get Course-Specific AI Teaching Insights
 * @route   GET /api/analytics/trainer/courses/:courseId/ai-insights
 * @route   POST /api/analytics/trainer/courses/:courseId/ai-insights/refresh
 * @access  Private / Trainer
 */
const getCourseAiTeachingInsights = async (req, res, next) => {
  try {
    const trainerId = req.user._id;
    const { courseId } = req.params;
    const isRefresh = req.query.refresh === 'true' || req.method === 'POST';
    const cacheKey = `${trainerId}_${courseId}`;

    if (!isRefresh && courseAiCache.has(cacheKey)) {
      const cached = courseAiCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          success: true,
          data: {
            ...cached.data,
            cached: true,
          },
        });
      }
    }

    // Verify course ownership strictly
    const course = await Course.findOne({ _id: courseId, trainer: trainerId })
      .populate('skills.skill', 'name category')
      .populate('skills', 'name category');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized to view course AI insights.',
      });
    }

    const [modules, assessments, quizAttempts, enrollments] = await Promise.all([
      Module.find({ course: courseId }).sort({ order: 1 }),
      Assessment.find({ course: courseId }),
      QuizAttempt.find({ course: courseId })
        .populate('trainee', 'name email')
        .populate('assessment', 'title type')
        .sort({ submittedAt: -1 }),
      Enrollment.find({ course: courseId }).populate('trainee', 'name email'),
    ]);

    // Calculate course-level deterministic stats
    const totalEnrolled = enrollments.length;
    const completedCount = enrollments.filter((e) => e.status === 'completed' || e.progress === 100).length;
    const completionPercentage = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;
    const avgProgress = totalEnrolled > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrolled)
      : 0;
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / quizAttempts.length)
      : 0;

    const courseData = {
      _id: course._id,
      title: course.title,
      category: course.category,
      level: course.level,
      enrollmentCount: totalEnrolled,
      averageProgress: avgProgress,
      completionPercentage,
      averageAssessmentScore: avgScore,
    };

    const questionStats = computeQuestionAccuracyStats(quizAttempts);
    const dropOffStats = computeModuleDropOffStats([course], modules, enrollments);
    const skillStats = computeSkillDifficultyStats([course], quizAttempts);
    const supportStats = computeLearnersNeedingSupport(quizAttempts, enrollments);

    const aiResult = await generateCourseSpecificAiInsights({
      course: courseData,
      modules,
      assessments,
      questionStats,
      dropOffStats,
      skillStats,
      supportStats,
      userId: trainerId.toString(),
    });

    const payload = {
      ...aiResult,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    courseAiCache.set(cacheKey, {
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
  getTrainerAiTeachingInsights,
  getCourseAiTeachingInsights,
  computeQuestionAccuracyStats,
  computeModuleDropOffStats,
  computeSkillDifficultyStats,
  computeLearnersNeedingSupport,
  invalidateTrainerAiCache,
};
