const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Competency = require('../models/Competency');
const CourseReview = require('../models/CourseReview');

// Proficiency ranking hierarchy
const PROFICIENCY_RANK = {
  beginner: 1,
  proficient: 2,
  advanced: 3,
};

const PROFICIENCY_LABEL = {
  beginner: 'Beginner',
  proficient: 'Proficient',
  advanced: 'Advanced',
};

/**
 * Helper to extract skill item from course.skills element
 */
const extractCourseSkillData = (item) => {
  if (!item) return null;
  let skillDoc = null;
  let proficiency = 'beginner';

  if (item.skill && typeof item.skill === 'object') {
    skillDoc = item.skill;
    proficiency = item.proficiency || 'beginner';
  } else if (item._id && item.name) {
    skillDoc = item;
    proficiency = item.proficiency || 'beginner';
  } else if (item.skill) {
    skillDoc = { _id: item.skill };
    proficiency = item.proficiency || 'beginner';
  } else {
    skillDoc = { _id: item };
    proficiency = 'beginner';
  }

  const normalizedProficiency = ['beginner', 'proficient', 'advanced'].includes(
    proficiency.toLowerCase().trim()
  )
    ? proficiency.toLowerCase().trim()
    : 'beginner';

  return {
    skill: skillDoc,
    proficiency: normalizedProficiency,
  };
};

/**
 * Helper to get course completion map for a trainee
 */
const getCourseCompletionMap = async (traineeId, courseIds) => {
  const publishedFinalAssessments = await Assessment.find({
    course: { $in: courseIds },
    type: 'final',
    status: 'published',
  }).select('course');

  const coursesWithFinalAssessment = new Set(
    publishedFinalAssessments.map((a) => a.course.toString())
  );

  const [passedAttempts, certificates] = await Promise.all([
    QuizAttempt.find({
      trainee: traineeId,
      course: { $in: courseIds },
      type: 'final',
      passed: true,
    }).sort({ percentage: -1, submittedAt: -1 }),
    Certificate.find({
      trainee: traineeId,
      course: { $in: courseIds },
      status: 'valid',
    }).sort({ issueDate: -1 }),
  ]);

  const attemptsByCourse = new Map();
  passedAttempts.forEach((att) => {
    const cId = att.course.toString();
    if (!attemptsByCourse.has(cId)) {
      attemptsByCourse.set(cId, att);
    }
  });

  const certsByCourse = new Map();
  certificates.forEach((cert) => {
    const cId = cert.course.toString();
    if (!certsByCourse.has(cId)) {
      certsByCourse.set(cId, cert);
    }
  });

  const coursesWithPassedFinal = new Set([
    ...Array.from(attemptsByCourse.keys()),
    ...Array.from(certsByCourse.keys()),
  ]);

  return {
    coursesWithFinalAssessment,
    coursesWithPassedFinal,
    attemptsByCourse,
    certsByCourse,
  };
};

/**
 * @desc    Get Trainee Personal Analytics & Performance Insights
 * @route   GET /api/analytics/trainee
 * @access  Private / Trainee
 */
const getTraineeAnalytics = async (req, res, next) => {
  try {
    const traineeId = req.user._id;

    // 1. Fetch Enrollments with populated course & skills
    const enrollments = await Enrollment.find({ trainee: traineeId })
      .populate({
        path: 'course',
        select: 'title category level status skills thumbnail',
        populate: {
          path: 'skills.skill',
          select: 'name category description isActive',
        },
      })
      .sort({ updatedAt: -1 });

    const enrolledCourseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

    // 2. Fetch Quiz Attempts & Certificates
    const [quizAttempts, certificates, competencies] = await Promise.all([
      QuizAttempt.find({ trainee: traineeId })
        .populate('course', 'title category')
        .populate('assessment', 'title type passingPercentage')
        .sort({ submittedAt: -1 }),
      Certificate.find({ trainee: traineeId, status: 'valid' })
        .populate('course', 'title category')
        .sort({ issueDate: -1 }),
      Competency.find({ isActive: true }).populate('skills', 'name category isActive'),
    ]);

    const {
      coursesWithFinalAssessment,
      coursesWithPassedFinal,
      attemptsByCourse,
      certsByCourse,
    } = await getCourseCompletionMap(traineeId, enrolledCourseIds);

    // 3. Learning Progress Calculation
    let totalProgressSum = 0;
    const learningProgress = [];
    const verifiedSkillMap = new Map();

    enrollments.forEach((e) => {
      const course = e.course;
      if (!course) return;

      const progress = e.progress || 0;
      totalProgressSum += progress;

      const cIdStr = course._id.toString();
      const hasFinalAssessment = coursesWithFinalAssessment.has(cIdStr);
      const hasPassedFinal = coursesWithPassedFinal.has(cIdStr);

      const isCourseVerified = hasFinalAssessment
        ? hasPassedFinal
        : e.status === 'completed' && e.progress === 100;

      learningProgress.push({
        courseId: course._id,
        courseTitle: course.title,
        category: course.category,
        level: course.level,
        progress: e.progress,
        status: isCourseVerified ? 'completed' : e.status,
        enrolledAt: e.createdAt,
        completedAt: isCourseVerified ? e.completedAt || certsByCourse.get(cIdStr)?.issueDate || new Date() : null,
      });

      // Aggregate verified skills
      if (isCourseVerified && Array.isArray(course.skills)) {
        course.skills.forEach((rawSkill) => {
          const extracted = extractCourseSkillData(rawSkill);
          if (!extracted || !extracted.skill || !extracted.skill._id) return;

          const sId = extracted.skill._id.toString();
          const prof = extracted.proficiency;
          const currentRank = PROFICIENCY_RANK[prof] || 1;

          if (!verifiedSkillMap.has(sId)) {
            verifiedSkillMap.set(sId, {
              _id: extracted.skill._id,
              name: extracted.skill.name || 'Skill',
              category: extracted.skill.category || 'Technical',
              highestProficiency: prof,
              highestProficiencyLabel: PROFICIENCY_LABEL[prof] || 'Beginner',
              rank: currentRank,
            });
          } else {
            const existing = verifiedSkillMap.get(sId);
            if (currentRank > existing.rank) {
              existing.highestProficiency = prof;
              existing.highestProficiencyLabel = PROFICIENCY_LABEL[prof];
              existing.rank = currentRank;
            }
          }
        });
      }
    });

    const totalEnrolled = enrollments.length;
    const completedCoursesCount = learningProgress.filter((p) => p.status === 'completed').length;
    const activeCoursesCount = totalEnrolled - completedCoursesCount;
    const overallProgress = totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;

    // 4. Assessment Performance
    const moduleQuizzes = quizAttempts.filter((a) => a.type === 'module' || a.type === 'quiz');
    const finalExams = quizAttempts.filter((a) => a.type === 'final');

    const quizzesPassed = moduleQuizzes.filter((a) => a.passed).length;
    const finalPassed = finalExams.filter((a) => a.passed).length;

    const totalScores = quizAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
    const averageScore = quizAttempts.length > 0 ? Math.round(totalScores / quizAttempts.length) : 0;

    const assessmentList = quizAttempts.map((a) => ({
      _id: a._id,
      assessmentTitle: a.assessment?.title || 'Assessment',
      courseTitle: a.course?.title || 'Course',
      type: a.type,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      passed: a.passed,
      submittedAt: a.submittedAt,
    }));

    // 5. Skill Distribution
    const verifiedSkillsList = Array.from(verifiedSkillMap.values());
    const skillDistribution = {
      beginner: verifiedSkillsList.filter((s) => s.highestProficiency === 'beginner').length,
      proficient: verifiedSkillsList.filter((s) => s.highestProficiency === 'proficient').length,
      advanced: verifiedSkillsList.filter((s) => s.highestProficiency === 'advanced').length,
      total: verifiedSkillsList.length,
    };

    // 6. Competency Progress
    let demonstratedCompetenciesCount = 0;
    const competencyProgress = competencies.map((comp) => {
      const required = comp.skills || [];
      let satisfiedCount = 0;

      const evaluatedSkills = required.map((s) => {
        const sId = s._id.toString();
        const verifiedSkill = verifiedSkillMap.get(sId);
        if (verifiedSkill) {
          satisfiedCount += 1;
        }
        return {
          _id: s._id,
          name: s.name,
          category: s.category,
          isSatisfied: Boolean(verifiedSkill),
          proficiency: verifiedSkill?.highestProficiencyLabel || null,
        };
      });

      const totalReq = required.length;
      const isDemonstrated = totalReq > 0 && satisfiedCount === totalReq;
      const pct = totalReq > 0 ? Math.round((satisfiedCount / totalReq) * 100) : 0;

      if (isDemonstrated) demonstratedCompetenciesCount += 1;

      return {
        _id: comp._id,
        name: comp.name,
        description: comp.description,
        totalRequiredSkills: totalReq,
        satisfiedSkillsCount: satisfiedCount,
        percentageDemonstrated: pct,
        status: isDemonstrated ? 'Demonstrated' : satisfiedCount > 0 ? 'In Progress' : 'Not Started',
        skills: evaluatedSkills,
      };
    });

    // 7. Chronological Learning / Assessment Trend
    // Group attempts by date
    const trendMap = new Map();
    [...quizAttempts].reverse().forEach((att) => {
      if (!att.submittedAt) return;
      const dateStr = new Date(att.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, { date: dateStr, attempts: 0, totalScore: 0, passedCount: 0 });
      }
      const entry = trendMap.get(dateStr);
      entry.attempts += 1;
      entry.totalScore += att.percentage || 0;
      if (att.passed) entry.passedCount += 1;
    });

    const learningTrend = Array.from(trendMap.values()).map((t) => ({
      date: t.date,
      averageScore: Math.round(t.totalScore / t.attempts),
      attempts: t.attempts,
      passed: t.passedCount,
    }));

    // 8. Certificates List
    const certList = certificates.map((c) => ({
      _id: c._id,
      certificateId: c.certificateId,
      courseId: c.course?._id,
      courseTitle: c.course?.title || 'Completed Course',
      percentage: c.percentage,
      issueDate: c.issuedAt || c.issueDate || c.createdAt,
      filePath: c.filePath,
    }));

    // 9. Unified Recent Activity Feed
    const activityEvents = [];

    enrollments.forEach((e) => {
      if (e.createdAt && e.course) {
        activityEvents.push({
          type: 'enrollment',
          title: `Enrolled in ${e.course.title}`,
          date: e.createdAt,
          badge: 'Enrolled',
          color: 'blue',
        });
      }
    });

    quizAttempts.forEach((a) => {
      if (a.submittedAt && a.course) {
        activityEvents.push({
          type: 'assessment',
          title: `${a.type === 'final' ? 'Final Exam' : 'Module Quiz'}: ${a.course.title}`,
          detail: `Score: ${a.percentage}% (${a.passed ? 'PASSED' : 'FAILED'})`,
          date: a.submittedAt,
          badge: a.passed ? 'Passed' : 'Failed',
          color: a.passed ? 'emerald' : 'red',
        });
      }
    });

    certificates.forEach((c) => {
      if (c.issueDate && c.course) {
        activityEvents.push({
          type: 'certificate',
          title: `Certificate Earned: ${c.course.title}`,
          detail: `ID: ${c.certificateId} • ${c.percentage}%`,
          date: c.issueDate,
          badge: 'Certified',
          color: 'indigo',
        });
      }
    });

    activityEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivity = activityEvents.slice(0, 10);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEnrolledCourses: totalEnrolled,
          activeCourses: activeCoursesCount,
          completedCourses: completedCoursesCount,
          overallProgress,
          quizzesAttempted: moduleQuizzes.length,
          quizzesPassed,
          finalAssessmentsAttempted: finalExams.length,
          finalAssessmentsPassed: finalPassed,
          certificatesEarned: certificates.length,
          verifiedSkills: verifiedSkillsList.length,
          competenciesDemonstrated: demonstratedCompetenciesCount,
          averageScore,
        },
        learningProgress,
        assessmentPerformance: {
          totalAttempts: quizAttempts.length,
          passedCount: quizAttempts.filter((a) => a.passed).length,
          failedCount: quizAttempts.filter((a) => !a.passed).length,
          averageScore,
          attempts: assessmentList,
        },
        skillDistribution,
        competencyProgress,
        learningTrend,
        certificates: certList,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Trainer Course & Learner Analytics
 * @route   GET /api/analytics/trainer
 * @access  Private / Trainer
 */
const getTrainerAnalytics = async (req, res, next) => {
  try {
    const trainerId = req.user._id;

    // 1. Fetch trainer's courses
    const courses = await Course.find({ trainer: trainerId })
      .populate('skills.skill', 'name category')
      .populate('skills', 'name category')
      .sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);

    // 2. Fetch Enrollments, Assessments, Quiz Attempts, Certificates, and Reviews for trainer's courses
    const [enrollments, assessments, quizAttempts, certificates, reviews] =
      await Promise.all([
        Enrollment.find({ course: { $in: courseIds } })
          .populate('trainee', 'name email')
          .populate('course', 'title category')
          .sort({ createdAt: -1 }),
        Assessment.find({ course: { $in: courseIds } }).populate('course', 'title'),
        QuizAttempt.find({ course: { $in: courseIds } })
          .populate('course', 'title')
          .populate('assessment', 'title type')
          .sort({ submittedAt: -1 }),
        Certificate.find({ course: { $in: courseIds }, status: 'valid' }),
        CourseReview.find({ course: { $in: courseIds } }),
      ]);

    // 3. Course-level metrics aggregation
    const courseStatsMap = new Map();
    courses.forEach((c) => {
      courseStatsMap.set(c._id.toString(), {
        courseId: c._id,
        title: c.title,
        category: c.category,
        level: c.level,
        status: c.status,
        enrollmentCount: 0,
        completedCount: 0,
        totalProgress: 0,
        scores: [],
        ratings: [],
      });
    });

    enrollments.forEach((e) => {
      const cId = e.course?._id?.toString() || e.course?.toString();
      if (courseStatsMap.has(cId)) {
        const stat = courseStatsMap.get(cId);
        stat.enrollmentCount += 1;
        stat.totalProgress += e.progress || 0;
        if (e.status === 'completed' || e.progress === 100) {
          stat.completedCount += 1;
        }
      }
    });

    quizAttempts.forEach((a) => {
      const cId = a.course?._id?.toString() || a.course?.toString();
      if (courseStatsMap.has(cId) && a.percentage !== undefined) {
        courseStatsMap.get(cId).scores.push(a.percentage);
      }
    });

    reviews.forEach((r) => {
      const cId = r.course?.toString();
      if (courseStatsMap.has(cId) && r.rating) {
        courseStatsMap.get(cId).ratings.push(r.rating);
      }
    });

    const coursePerformance = Array.from(courseStatsMap.values()).map((stat) => {
      const avgProgress =
        stat.enrollmentCount > 0 ? Math.round(stat.totalProgress / stat.enrollmentCount) : 0;
      const completionPercentage =
        stat.enrollmentCount > 0
          ? Math.round((stat.completedCount / stat.enrollmentCount) * 100)
          : 0;
      const avgScore =
        stat.scores.length > 0
          ? Math.round(stat.scores.reduce((s, x) => s + x, 0) / stat.scores.length)
          : 0;
      const avgRating =
        stat.ratings.length > 0
          ? Number((stat.ratings.reduce((s, x) => s + x, 0) / stat.ratings.length).toFixed(1))
          : 0;

      return {
        courseId: stat.courseId,
        title: stat.title,
        category: stat.category,
        level: stat.level,
        status: stat.status,
        enrollmentCount: stat.enrollmentCount,
        averageProgress: avgProgress,
        completedCount: stat.completedCount,
        completionPercentage,
        averageAssessmentScore: avgScore,
        reviewCount: stat.ratings.length,
        averageRating: avgRating,
      };
    });

    // 4. Learner Progress Distribution (0-25, 26-50, 51-75, 76-99, 100)
    const progressBuckets = {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-99%': 0,
      '100%': 0,
    };

    enrollments.forEach((e) => {
      const p = e.progress || 0;
      if (p === 100 || e.status === 'completed') {
        progressBuckets['100%'] += 1;
      } else if (p >= 76) {
        progressBuckets['76-99%'] += 1;
      } else if (p >= 51) {
        progressBuckets['51-75%'] += 1;
      } else if (p >= 26) {
        progressBuckets['26-50%'] += 1;
      } else {
        progressBuckets['0-25%'] += 1;
      }
    });

    const learnerProgressDistribution = Object.entries(progressBuckets).map(([range, count]) => ({
      range,
      count,
    }));

    // 5. Assessment Performance
    const assessmentStatsMap = new Map();
    assessments.forEach((a) => {
      assessmentStatsMap.set(a._id.toString(), {
        assessmentId: a._id,
        title: a.title,
        courseTitle: a.course?.title || 'Course',
        type: a.type,
        passingPercentage: a.passingPercentage || 70,
        attempts: 0,
        passedCount: 0,
        totalScore: 0,
      });
    });

    quizAttempts.forEach((a) => {
      const aId = a.assessment?._id?.toString() || a.assessment?.toString();
      if (assessmentStatsMap.has(aId)) {
        const stat = assessmentStatsMap.get(aId);
        stat.attempts += 1;
        stat.totalScore += a.percentage || 0;
        if (a.passed) stat.passedCount += 1;
      }
    });

    const assessmentPerformance = Array.from(assessmentStatsMap.values()).map((a) => ({
      assessmentId: a.assessmentId,
      title: a.title,
      courseTitle: a.courseTitle,
      type: a.type,
      attempts: a.attempts,
      passedCount: a.passedCount,
      passRate: a.attempts > 0 ? Math.round((a.passedCount / a.attempts) * 100) : 0,
      averageScore: a.attempts > 0 ? Math.round(a.totalScore / a.attempts) : 0,
    }));

    // 6. Skills Taught by Trainer's Courses
    const skillsTaughtMap = new Map();
    courses.forEach((c) => {
      if (Array.isArray(c.skills)) {
        c.skills.forEach((raw) => {
          const extracted = extractCourseSkillData(raw);
          if (!extracted || !extracted.skill || !extracted.skill._id) return;
          const sId = extracted.skill._id.toString();
          const sName = extracted.skill.name || 'Skill';
          const sCat = extracted.skill.category || 'Technical';
          const prof = extracted.proficiency || 'beginner';

          if (!skillsTaughtMap.has(sId)) {
            skillsTaughtMap.set(sId, {
              skillId: extracted.skill._id,
              name: sName,
              category: sCat,
              proficiencies: new Set(),
              courseCount: 0,
            });
          }
          const item = skillsTaughtMap.get(sId);
          item.proficiencies.add(prof);
          item.courseCount += 1;
        });
      }
    });

    const skillsTaught = Array.from(skillsTaughtMap.values()).map((s) => ({
      skillId: s.skillId,
      name: s.name,
      category: s.category,
      proficiencies: Array.from(s.proficiencies),
      courseCount: s.courseCount,
    }));

    // 7. Enrollment Trend over Time
    const enrollmentDateMap = new Map();
    [...enrollments].reverse().forEach((e) => {
      if (!e.createdAt) return;
      const dStr = new Date(e.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      enrollmentDateMap.set(dStr, (enrollmentDateMap.get(dStr) || 0) + 1);
    });

    const enrollmentTrend = Array.from(enrollmentDateMap.entries()).map(([date, count]) => ({
      date,
      enrollments: count,
    }));

    // Summary counts
    const uniqueLearners = new Set(
      enrollments.map((e) => e.trainee?._id?.toString() || e.trainee?.toString()).filter(Boolean)
    );
    const publishedCount = courses.filter((c) => c.status === 'published').length;
    const completedEnrollmentsCount = enrollments.filter(
      (e) => e.status === 'completed' || e.progress === 100
    ).length;
    const overallCompletionRate =
      enrollments.length > 0
        ? Math.round((completedEnrollmentsCount / enrollments.length) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCourses: courses.length,
          publishedCourses: publishedCount,
          draftCourses: courses.length - publishedCount,
          totalLearners: uniqueLearners.size,
          totalEnrollments: enrollments.length,
          completedEnrollments: completedEnrollmentsCount,
          completionRate: overallCompletionRate,
          totalAssessments: assessments.length,
          totalCertificatesIssued: certificates.length,
        },
        coursePerformance,
        assessmentPerformance,
        learnerProgressDistribution,
        skillsTaught,
        enrollmentTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Platform-Wide Admin Analytics
 * @route   GET /api/analytics/admin
 * @access  Private / Admin
 */
const getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. Concurrent aggregate queries across all platform models
    const [
      users,
      courses,
      enrollments,
      assessments,
      quizAttempts,
      certificates,
      skills,
      competencies,
    ] = await Promise.all([
      User.find().select('name email role createdAt'),
      Course.find()
        .populate('trainer', 'name email department')
        .populate('skills.skill', 'name category')
        .populate('skills', 'name category')
        .select('title category level status trainer enrolledCount skills createdAt'),
      Enrollment.find().select('trainee course status progress completedAt createdAt'),
      Assessment.find().select('title type course status passingPercentage'),
      QuizAttempt.find().select('trainee course assessment type percentage passed submittedAt'),
      Certificate.find({ status: 'valid' }).select('trainee course trainer percentage issueDate'),
      Skill.find().select('name category normalizedName isActive'),
      Competency.find({ isActive: true }).populate('skills', 'name category isActive'),
    ]);

    // 2. User Distribution
    const traineesCount = users.filter((u) => u.role === 'trainee').length;
    const trainersCount = users.filter((u) => u.role === 'trainer').length;
    const adminsCount = users.filter((u) => u.role === 'admin').length;

    const userDistribution = [
      { role: 'Trainees', count: traineesCount },
      { role: 'Trainers', count: trainersCount },
      { role: 'Admins', count: adminsCount },
    ];

    // 3. Course Statistics
    const publishedCourses = courses.filter((c) => c.status === 'published').length;
    const draftCourses = courses.filter((c) => c.status === 'draft').length;

    const courseStatusDistribution = [
      { status: 'Published', count: publishedCourses },
      { status: 'Draft', count: draftCourses },
    ];

    // 4. Course Enrollment & Completion Aggregation (Top Courses)
    const courseEnrollmentMap = new Map();
    const courseCompletionMap = new Map();

    enrollments.forEach((e) => {
      const cId = e.course?.toString();
      if (cId) {
        courseEnrollmentMap.set(cId, (courseEnrollmentMap.get(cId) || 0) + 1);
        if (e.status === 'completed' || e.progress === 100) {
          courseCompletionMap.set(cId, (courseCompletionMap.get(cId) || 0) + 1);
        }
      }
    });

    const topCourses = courses
      .map((c) => {
        const cId = c._id.toString();
        const enrollCount = courseEnrollmentMap.get(cId) || 0;
        const compCount = courseCompletionMap.get(cId) || 0;
        const compRate = enrollCount > 0 ? Math.round((compCount / enrollCount) * 100) : 0;
        return {
          courseId: c._id,
          title: c.title,
          category: c.category,
          level: c.level,
          trainerName: c.trainer?.name || 'Trainer',
          enrollmentCount: enrollCount,
          completionCount: compCount,
          completionPercentage: compRate,
        };
      })
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 8);

    // 5. Timeline Trends (Enrollments & Completions)
    const timelineMap = new Map();
    enrollments.forEach((e) => {
      if (!e.createdAt) return;
      const dStr = new Date(e.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!timelineMap.has(dStr)) {
        timelineMap.set(dStr, { date: dStr, enrollments: 0, completions: 0 });
      }
      timelineMap.get(dStr).enrollments += 1;
    });

    enrollments.forEach((e) => {
      if (e.completedAt || (e.status === 'completed' && e.updatedAt)) {
        const dStr = new Date(e.completedAt || e.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!timelineMap.has(dStr)) {
          timelineMap.set(dStr, { date: dStr, enrollments: 0, completions: 0 });
        }
        timelineMap.get(dStr).completions += 1;
      }
    });

    const enrollmentTrend = Array.from(timelineMap.values());

    // 6. Assessment Statistics
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter((a) => a.passed).length;
    const failedAttempts = totalAttempts - passedAttempts;
    const passPercentage = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const avgScore =
      totalAttempts > 0
        ? Math.round(quizAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / totalAttempts)
        : 0;

    const assessmentStatistics = {
      totalAttempts,
      passCount: passedAttempts,
      failCount: failedAttempts,
      passPercentage,
      averageScore: avgScore,
    };

    // 7. Verified Skills Distribution by Proficiency & Popular Skills
    // Calculate verified skills across all valid certificates
    const verifiedSkillProficiencyCount = {
      beginner: 0,
      proficient: 0,
      advanced: 0,
    };
    const skillPopularityMap = new Map();

    skills.forEach((s) => {
      skillPopularityMap.set(s._id.toString(), {
        skillId: s._id,
        name: s.name,
        category: s.category,
        coursesCount: 0,
      });
    });

    courses.forEach((c) => {
      if (Array.isArray(c.skills)) {
        c.skills.forEach((raw) => {
          const extracted = extractCourseSkillData(raw);
          if (extracted?.skill?._id) {
            const sId = extracted.skill._id.toString();
            if (skillPopularityMap.has(sId)) {
              skillPopularityMap.get(sId).coursesCount += 1;
            }
            const prof = extracted.proficiency || 'beginner';
            if (verifiedSkillProficiencyCount[prof] !== undefined) {
              verifiedSkillProficiencyCount[prof] += 1;
            }
          }
        });
      }
    });

    const popularSkills = Array.from(skillPopularityMap.values())
      .sort((a, b) => b.coursesCount - a.coursesCount)
      .slice(0, 8);

    const skillsDistribution = {
      beginner: verifiedSkillProficiencyCount.beginner,
      proficient: verifiedSkillProficiencyCount.proficient,
      advanced: verifiedSkillProficiencyCount.advanced,
      total: skills.length,
    };

    // 8. Competency Overview
    const competencyOverview = competencies.map((comp) => {
      const reqCount = comp.skills?.length || 0;
      return {
        _id: comp._id,
        name: comp.name,
        description: comp.description,
        totalRequiredSkills: reqCount,
        requiredSkillNames: (comp.skills || []).map((s) => s.name),
      };
    });

    // 9. Trainer Activity Table
    const trainerStatsMap = new Map();
    users
      .filter((u) => u.role === 'trainer')
      .forEach((t) => {
        trainerStatsMap.set(t._id.toString(), {
          trainerId: t._id,
          name: t.name,
          email: t.email,
          courseCount: 0,
          publishedCourseCount: 0,
          enrollmentsCount: 0,
          completionsCount: 0,
        });
      });

    courses.forEach((c) => {
      const tId = c.trainer?._id?.toString() || c.trainer?.toString();
      if (trainerStatsMap.has(tId)) {
        const stat = trainerStatsMap.get(tId);
        stat.courseCount += 1;
        if (c.status === 'published') stat.publishedCourseCount += 1;
        stat.enrollmentsCount += courseEnrollmentMap.get(c._id.toString()) || 0;
        stat.completionsCount += courseCompletionMap.get(c._id.toString()) || 0;
      }
    });

    const trainerActivity = Array.from(trainerStatsMap.values()).sort(
      (a, b) => b.enrollmentsCount - a.enrollmentsCount
    );

    const totalEnrollmentsCount = enrollments.length;
    const completedEnrollmentsCount = enrollments.filter(
      (e) => e.status === 'completed' || e.progress === 100
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers: users.length,
          totalTrainees: traineesCount,
          totalTrainers: trainersCount,
          totalAdmins: adminsCount,
          totalCourses: courses.length,
          publishedCourses,
          draftCourses,
          totalEnrollments: totalEnrollmentsCount,
          completedEnrollments: completedEnrollmentsCount,
          platformCompletionRate:
            totalEnrollmentsCount > 0
              ? Math.round((completedEnrollmentsCount / totalEnrollmentsCount) * 100)
              : 0,
          totalAssessments: assessments.length,
          totalCertificates: certificates.length,
          totalSkills: skills.length,
          totalCompetencies: competencies.length,
        },
        userDistribution,
        courseStatusDistribution,
        topCourses,
        enrollmentTrend,
        assessmentStatistics,
        skillsDistribution,
        popularSkills,
        competencyOverview,
        trainerActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTraineeAnalytics,
  getTrainerAnalytics,
  getAdminAnalytics,
};
