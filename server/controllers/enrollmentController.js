const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Assessment = require('../models/Assessment');

/**
 * @desc    Enroll authenticated trainee in a published course
 * @route   POST /api/courses/:courseId/enroll
 * @access  Private (Trainee only)
 */
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const traineeId = req.user._id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Trainees can only enroll in published courses
    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in a course that is not published',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      trainee: traineeId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course',
        data: existingEnrollment,
      });
    }

    // Create enrollment record
    const enrollment = await Enrollment.create({
      trainee: traineeId,
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
      status: 'active',
    });

    // Increment course enrolled count
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id).populate({
      path: 'course',
      populate: { path: 'trainer', select: 'name email department' },
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: populatedEnrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all courses enrolled by the authenticated trainee
 * @route   GET /api/enrollments/my-courses
 * @access  Private (Trainee only)
 */
const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const traineeId = req.user._id;

    const enrollments = await Enrollment.find({ trainee: traineeId })
      .populate({
        path: 'course',
        populate: { path: 'trainer', select: 'name email department' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check enrollment status for a specific course
 * @route   GET /api/courses/:courseId/enrollment
 * @access  Private (Trainee only)
 */
const getCourseEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const traineeId = req.user._id;

    const enrollment = await Enrollment.findOne({
      trainee: traineeId,
      course: courseId,
    });

    return res.status(200).json({
      success: true,
      isEnrolled: Boolean(enrollment),
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enrolled learners for a specific course (Trainer ownership enforced, Admin)
 * @route   GET /api/courses/:courseId/learners
 * @access  Private (Owner Trainer, Admin)
 */
const getCourseLearners = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Ownership check: Trainer can only view learners for their own courses
    if (req.user.role === 'trainer') {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view enrolled learners for courses you instruct.',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('trainee', 'name email department role')
      .sort({ enrolledAt: -1 });

    const learners = enrollments.map((e) => ({
      _id: e._id,
      traineeId: e.trainee?._id,
      name: e.trainee?.name || 'Learner',
      email: e.trainee?.email || 'N/A',
      department: e.trainee?.department || 'N/A',
      enrolledAt: e.enrolledAt || e.createdAt,
      status: e.status || 'active',
      progress: e.progress || 0,
    }));

    return res.status(200).json({
      success: true,
      count: learners.length,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          enrolledCount: course.enrolledCount || learners.length,
        },
        learners,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle completed status for a specific module by an enrolled trainee
 * @route   PUT /api/courses/:courseId/modules/:moduleId/toggle-complete
 * @access  Private (Enrolled Trainee only)
 */
const toggleModuleCompletion = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const traineeId = req.user._id;

    const enrollment = await Enrollment.findOne({
      trainee: traineeId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found. Please enroll in this course first.',
      });
    }

    const totalModules = await Module.countDocuments({ course: courseId });
    const currentCompleted = enrollment.completedModules
      ? enrollment.completedModules.map((id) => id.toString())
      : [];

    let updatedCompleted;
    const isAlreadyCompleted = currentCompleted.includes(moduleId.toString());

    if (isAlreadyCompleted) {
      updatedCompleted = currentCompleted.filter((id) => id !== moduleId.toString());
    } else {
      updatedCompleted = [...currentCompleted, moduleId.toString()];
    }

    enrollment.completedModules = updatedCompleted;
    const progress =
      totalModules > 0 ? Math.round((updatedCompleted.length / totalModules) * 100) : 0;
    enrollment.progress = Math.min(100, Math.max(0, progress));

    const hasPublishedFinal = await Assessment.exists({
      course: courseId,
      type: 'final',
      status: 'published',
    });

    if (enrollment.progress === 100 && !hasPublishedFinal) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    } else {
      enrollment.status = 'active';
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: !isAlreadyCompleted
        ? 'Module marked as completed'
        : 'Module marked as incomplete',
      data: {
        moduleId,
        isCompleted: !isAlreadyCompleted,
        completedModules: enrollment.completedModules,
        progress: enrollment.progress,
        status: enrollment.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrolledCourses,
  getCourseEnrollment,
  getCourseLearners,
  toggleModuleCompletion,
};

