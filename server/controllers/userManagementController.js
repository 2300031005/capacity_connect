const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const QuizAttempt = require('../models/QuizAttempt');
const CourseReview = require('../models/CourseReview');

/**
 * @desc    Get all platform users with filtering (Admin only)
 * @route   GET /api/users
 * @access  Private / Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, department } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role.toLowerCase().trim();
    }

    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (department && department.trim()) {
      query.department = new RegExp(department.trim(), 'i');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { department: searchRegex }];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user details with role-specific portfolio/metrics (Admin only)
 * @route   GET /api/users/:id
 * @access  Private / Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let roleData = {};

    // Trainee Portfolio & Metrics
    if (user.role === 'trainee') {
      const [enrollments, certificates] = await Promise.all([
        Enrollment.find({ trainee: user._id })
          .populate({
            path: 'course',
            select: 'title category level status skills thumbnail',
            populate: { path: 'skills.skill', select: 'name category' },
          })
          .sort({ updatedAt: -1 }),
        Certificate.find({ trainee: user._id, status: 'valid' })
          .populate('course', 'title category')
          .sort({ issueDate: -1 }),
      ]);

      const completedCourses = enrollments.filter(
        (e) => e.status === 'completed' || e.progress === 100
      );

      roleData = {
        totalEnrolled: enrollments.length,
        completedCount: completedCourses.length,
        certificatesEarned: certificates.length,
        enrollments: enrollments.map((e) => ({
          enrollmentId: e._id,
          courseId: e.course?._id,
          courseTitle: e.course?.title || 'Unknown Course',
          category: e.course?.category,
          level: e.course?.level,
          progress: e.progress,
          status: e.status,
          enrolledAt: e.createdAt,
          completedAt: e.completedAt,
        })),
        certificates: certificates.map((c) => ({
          certificateId: c.certificateId,
          courseTitle: c.course?.title || 'Course',
          percentage: c.percentage,
          issueDate: c.issueDate || c.issuedAt,
        })),
      };
    }

    // Trainer Metrics
    if (user.role === 'trainer') {
      const courses = await Course.find({ trainer: user._id })
        .select('title category level status enrolledCount createdAt')
        .sort({ createdAt: -1 });

      const courseIds = courses.map((c) => c._id);
      const enrollments = await Enrollment.find({ course: { $in: courseIds } });
      const reviews = await CourseReview.find({ course: { $in: courseIds } });

      const uniqueLearners = new Set(enrollments.map((e) => e.trainee?.toString()));
      const publishedCount = courses.filter((c) => c.status === 'published').length;

      const avgRating =
        reviews.length > 0
          ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
          : 0;

      roleData = {
        totalCourses: courses.length,
        publishedCourses: publishedCount,
        totalLearners: uniqueLearners.size,
        totalEnrollments: enrollments.length,
        averageRating: avgRating,
        courses: courses.map((c) => ({
          courseId: c._id,
          title: c.title,
          category: c.category,
          level: c.level,
          status: c.status,
          enrolledCount: c.enrolledCount || 0,
          createdAt: c.createdAt,
        })),
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
        roleData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or update user active status (Admin only)
 * @route   PATCH /api/users/:id/status
 * @access  Private / Admin
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Prevent Admin from deactivating themselves
    if (req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: Administrators cannot deactivate their own account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.isActive !== undefined) {
      user.isActive = Boolean(req.body.isActive);
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all platform trainers with capacity metrics (Admin only)
 * @route   GET /api/trainers
 * @access  Private / Admin
 */
const getTrainers = async (req, res, next) => {
  try {
    const trainers = await User.find({ role: 'trainer' })
      .select('-password')
      .sort({ createdAt: -1 });

    const trainerIds = trainers.map((t) => t._id);

    const [courses, reviews] = await Promise.all([
      Course.find({ trainer: { $in: trainerIds } }).select('trainer status enrolledCount title category'),
      CourseReview.find().select('course rating'),
    ]);

    const trainerCoursesMap = new Map();
    const courseToTrainerMap = new Map();

    courses.forEach((c) => {
      const tId = c.trainer.toString();
      if (!trainerCoursesMap.has(tId)) {
        trainerCoursesMap.set(tId, []);
      }
      trainerCoursesMap.get(tId).push(c);
      courseToTrainerMap.set(c._id.toString(), tId);
    });

    const trainerRatingsMap = new Map();
    reviews.forEach((r) => {
      const cId = r.course?.toString();
      const tId = courseToTrainerMap.get(cId);
      if (tId && r.rating) {
        if (!trainerRatingsMap.has(tId)) {
          trainerRatingsMap.set(tId, []);
        }
        trainerRatingsMap.get(tId).push(r.rating);
      }
    });

    const trainerList = trainers.map((t) => {
      const tId = t._id.toString();
      const tCourses = trainerCoursesMap.get(tId) || [];
      const published = tCourses.filter((c) => c.status === 'published').length;
      const totalEnrollments = tCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
      const ratings = trainerRatingsMap.get(tId) || [];
      const avgRating =
        ratings.length > 0
          ? Number((ratings.reduce((s, x) => s + x, 0) / ratings.length).toFixed(1))
          : 0;

      return {
        _id: t._id,
        name: t.name,
        email: t.email,
        department: t.department || 'General',
        isActive: t.isActive,
        createdAt: t.createdAt,
        totalCourses: tCourses.length,
        publishedCourses: published,
        totalLearners: totalEnrollments,
        averageRating: avgRating,
        reviewCount: ratings.length,
      };
    });

    return res.status(200).json({
      success: true,
      count: trainerList.length,
      data: trainerList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trainer profile and course roster (Admin only)
 * @route   GET /api/trainers/:id
 * @access  Private / Admin
 */
const getTrainerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trainer ID' });
    }

    const trainer = await User.findOne({ _id: id, role: 'trainer' }).select('-password');
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const courses = await Course.find({ trainer: trainer._id })
      .select('title category level status enrolledCount createdAt')
      .sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);
    const [enrollments, reviews] = await Promise.all([
      Enrollment.find({ course: { $in: courseIds } }),
      CourseReview.find({ course: { $in: courseIds } }),
    ]);

    const uniqueLearners = new Set(enrollments.map((e) => e.trainee?.toString()));
    const publishedCount = courses.filter((c) => c.status === 'published').length;

    const courseStats = courses.map((c) => {
      const cIdStr = c._id.toString();
      const cEnrollments = enrollments.filter((e) => e.course?.toString() === cIdStr);
      const cCompletions = cEnrollments.filter((e) => e.status === 'completed' || e.progress === 100);
      const cReviews = reviews.filter((r) => r.course?.toString() === cIdStr);
      const cAvgRating =
        cReviews.length > 0
          ? Number((cReviews.reduce((s, r) => s + r.rating, 0) / cReviews.length).toFixed(1))
          : 0;

      return {
        courseId: c._id,
        title: c.title,
        category: c.category,
        level: c.level,
        status: c.status,
        enrollmentCount: cEnrollments.length,
        completionCount: cCompletions.length,
        averageRating: cAvgRating,
        createdAt: c.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        trainer,
        summary: {
          totalCourses: courses.length,
          publishedCourses: publishedCount,
          totalLearners: uniqueLearners.size,
          totalEnrollments: enrollments.length,
        },
        courses: courseStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getTrainers,
  getTrainerById,
};
