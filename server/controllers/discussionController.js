const CourseDiscussionMessage = require('../models/CourseDiscussionMessage');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * Helper to verify if the requesting user can access/participate in course discussions
 */
const verifyDiscussionAccess = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) {
    return { authorized: false, statusCode: 404, message: 'Course not found' };
  }

  if (user.role === 'admin') {
    return { authorized: true, course };
  }

  if (user.role === 'trainer') {
    const isOwner =
      course.trainer.toString() === user._id.toString() ||
      course.trainer.toString() === user.id;
    if (!isOwner) {
      return {
        authorized: false,
        statusCode: 403,
        message: 'You can only access discussions for courses you instruct.',
      };
    }
    return { authorized: true, course };
  }

  if (user.role === 'trainee') {
    const enrollment = await Enrollment.findOne({
      trainee: user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] },
    });

    if (!enrollment) {
      return {
        authorized: false,
        statusCode: 403,
        message: 'Enroll in this course to participate in the discussion.',
      };
    }
    return { authorized: true, course };
  }

  return { authorized: false, statusCode: 403, message: 'Access denied' };
};

/**
 * @desc    Get all discussion messages for a course
 * @route   GET /api/courses/:courseId/discussions
 * @access  Private (Enrolled Trainees, Owner Trainer, Admin)
 */
const getCourseDiscussions = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const access = await verifyDiscussionAccess(courseId, req.user);
    if (!access.authorized) {
      return res.status(access.statusCode).json({
        success: false,
        message: access.message,
      });
    }

    const messages = await CourseDiscussionMessage.find({ course: courseId })
      .populate('sender', 'name role department')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a new message in the course discussion
 * @route   POST /api/courses/:courseId/discussions
 * @access  Private (Enrolled Trainees, Owner Trainer, Admin)
 */
const createCourseDiscussionMessage = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { message } = req.body;

    const access = await verifyDiscussionAccess(courseId, req.user);
    if (!access.authorized) {
      return res.status(access.statusCode).json({
        success: false,
        message: access.message,
      });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    const sanitizedMessage = message.trim();
    if (sanitizedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 1000 characters.',
      });
    }

    const newMsg = await CourseDiscussionMessage.create({
      course: courseId,
      sender: req.user._id,
      message: sanitizedMessage,
    });

    const populatedMsg = await CourseDiscussionMessage.findById(newMsg._id).populate(
      'sender',
      'name role department'
    );

    return res.status(201).json({
      success: true,
      data: populatedMsg,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseDiscussions,
  createCourseDiscussionMessage,
};
