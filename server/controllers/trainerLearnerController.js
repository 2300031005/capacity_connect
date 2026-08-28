const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const Module = require('../models/Module');
const Assessment = require('../models/Assessment');

/**
 * @desc    Get consolidated list of learners enrolled in trainer's courses
 * @route   GET /api/trainer/learners
 * @access  Private / Trainer
 */
const getTrainerLearners = async (req, res, next) => {
  try {
    const trainerId = req.user._id;

    // 1. Fetch courses owned strictly by this trainer
    const trainerCourses = await Course.find({ trainer: trainerId }).select('_id title category level');
    const courseIds = trainerCourses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // 2. Fetch all enrollments for trainer's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('trainee', 'name email department isActive createdAt')
      .populate('course', 'title category level')
      .sort({ updatedAt: -1 });

    // 3. Fetch certificates earned for trainer's courses
    const certificates = await Certificate.find({
      course: { $in: courseIds },
      status: 'valid',
    }).select('trainee course certificateId percentage');

    const certMap = new Map();
    certificates.forEach((c) => {
      const key = `${c.trainee.toString()}_${c.course.toString()}`;
      certMap.set(key, c);
    });

    // 4. Group by Trainee (Unique Learners)
    const learnerMap = new Map();

    enrollments.forEach((e) => {
      if (!e.trainee) return;
      const tId = e.trainee._id.toString();

      if (!learnerMap.has(tId)) {
        learnerMap.set(tId, {
          trainee: {
            _id: e.trainee._id,
            name: e.trainee.name,
            email: e.trainee.email,
            department: e.trainee.department || 'General',
            isActive: e.trainee.isActive,
            createdAt: e.trainee.createdAt,
          },
          coursesEnrolledCount: 0,
          coursesCompletedCount: 0,
          totalProgressSum: 0,
          certificatesEarnedCount: 0,
          lastActivity: e.updatedAt || e.createdAt,
          enrolledCourses: [],
        });
      }

      const entry = learnerMap.get(tId);
      entry.coursesEnrolledCount += 1;
      const progress = e.progress || 0;
      entry.totalProgressSum += progress;

      const isCompleted = e.status === 'completed' || progress === 100;
      if (isCompleted) {
        entry.coursesCompletedCount += 1;
      }

      const certKey = `${tId}_${e.course?._id?.toString()}`;
      const hasCert = certMap.has(certKey);
      if (hasCert) {
        entry.certificatesEarnedCount += 1;
      }

      if (e.updatedAt && new Date(e.updatedAt) > new Date(entry.lastActivity)) {
        entry.lastActivity = e.updatedAt;
      }

      entry.enrolledCourses.push({
        courseId: e.course?._id,
        courseTitle: e.course?.title,
        progress,
        status: e.status,
        hasCertificate: hasCert,
      });
    });

    const learners = Array.from(learnerMap.values()).map((item) => ({
      trainee: item.trainee,
      coursesEnrolledCount: item.coursesEnrolledCount,
      coursesCompletedCount: item.coursesCompletedCount,
      averageProgress:
        item.coursesEnrolledCount > 0
          ? Math.round(item.totalProgressSum / item.coursesEnrolledCount)
          : 0,
      certificatesEarnedCount: item.certificatesEarnedCount,
      lastActivity: item.lastActivity,
      enrolledCourses: item.enrolledCourses,
    }));

    return res.status(200).json({
      success: true,
      count: learners.length,
      data: learners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed learner progress strictly for trainer's owned courses
 * @route   GET /api/trainer/learners/:id
 * @access  Private / Trainer
 */
const getTrainerLearnerDetails = async (req, res, next) => {
  try {
    const trainerId = req.user._id;
    const traineeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(traineeId)) {
      return res.status(400).json({ success: false, message: 'Invalid learner ID' });
    }

    const trainee = await User.findOne({ _id: traineeId, role: 'trainee' }).select('-password');
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Learner not found' });
    }

    // 1. Fetch courses owned strictly by this trainer
    const trainerCourses = await Course.find({ trainer: trainerId }).select('_id title category level');
    const courseIds = trainerCourses.map((c) => c._id);

    // 2. Fetch enrollments for this trainee strictly in trainer's courses
    const enrollments = await Enrollment.find({
      trainee: traineeId,
      course: { $in: courseIds },
    })
      .populate('course', 'title category level status')
      .sort({ createdAt: -1 });

    if (enrollments.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This learner is not enrolled in any of your courses.',
      });
    }

    // 3. Fetch modules, assessments, quiz attempts, and certificates for trainer's courses only
    const [modules, assessments, quizAttempts, certificates] = await Promise.all([
      Module.find({ course: { $in: courseIds } }).select('_id title course order'),
      Assessment.find({ course: { $in: courseIds } }).select('_id title course module type passingPercentage'),
      QuizAttempt.find({ trainee: traineeId, course: { $in: courseIds } })
        .populate('assessment', 'title type passingPercentage')
        .populate('course', 'title')
        .sort({ submittedAt: -1 }),
      Certificate.find({
        trainee: traineeId,
        course: { $in: courseIds },
        status: 'valid',
      }),
    ]);

    const certMap = new Map();
    certificates.forEach((c) => {
      certMap.set(c.course.toString(), c);
    });

    const courseBreakdown = enrollments.map((e) => {
      const cIdStr = e.course?._id?.toString();
      const courseModules = modules.filter((m) => m.course?.toString() === cIdStr);
      const courseAssessments = assessments.filter((a) => a.course?.toString() === cIdStr);
      const courseAttempts = quizAttempts.filter((a) => a.course?._id?.toString() === cIdStr);
      const cert = certMap.get(cIdStr);

      const completedModuleIds = new Set(
        (e.completedModules || []).map((id) => id.toString())
      );

      return {
        courseId: e.course?._id,
        courseTitle: e.course?.title,
        category: e.course?.category,
        level: e.course?.level,
        progress: e.progress,
        status: e.status,
        enrolledAt: e.createdAt,
        completedAt: e.completedAt,
        totalModulesCount: courseModules.length,
        completedModulesCount: completedModuleIds.size,
        modules: courseModules.map((m) => ({
          moduleId: m._id,
          title: m.title,
          isCompleted: completedModuleIds.has(m._id.toString()),
        })),
        attempts: courseAttempts.map((att) => ({
          attemptId: att._id,
          assessmentTitle: att.assessment?.title || 'Quiz',
          type: att.type,
          score: att.score,
          totalMarks: att.totalMarks,
          percentage: att.percentage,
          passed: att.passed,
          submittedAt: att.submittedAt,
        })),
        certificate: cert
          ? {
              certificateId: cert.certificateId,
              percentage: cert.percentage,
              issueDate: cert.issueDate || cert.issuedAt,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        learner: trainee,
        summary: {
          trainerCoursesEnrolled: enrollments.length,
          trainerCoursesCompleted: courseBreakdown.filter((c) => c.status === 'completed' || c.progress === 100).length,
          certificatesEarned: certificates.length,
        },
        courses: courseBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrainerLearners,
  getTrainerLearnerDetails,
};
