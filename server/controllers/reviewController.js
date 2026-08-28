const CourseReview = require('../models/CourseReview');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * @desc    Get all reviews and rating summary for a course
 * @route   GET /api/courses/:courseId/reviews
 * @access  Public / Authenticated
 */
const getCourseReviews = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Fetch all reviews for the course
    const reviews = await CourseReview.find({ course: courseId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    // Check if the current user has already submitted a review
    let myReview = null;
    if (req.user) {
      myReview = reviews.find((r) => r.user?._id?.toString() === req.user._id.toString()) || null;
    }

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
        myReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a course review
 * @route   POST /api/courses/:courseId/reviews
 * @access  Private (Enrolled Trainees only)
 */
const createCourseReview = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // 1. Role Check: Only Trainees can submit course reviews
    if (req.user.role !== 'trainee') {
      return res.status(403).json({
        success: false,
        message: 'Only enrolled trainees can submit reviews for this course.',
      });
    }

    // 2. Enrollment Check: Trainee MUST be enrolled
    const enrollment = await Enrollment.findOne({
      trainee: req.user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must enroll in this course before submitting a review.',
      });
    }

    // 3. Validation: Rating must be an integer between 1 and 5
    const parsedRating = Number(rating);
    if (
      !Number.isInteger(parsedRating) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer from 1 to 5.',
      });
    }

    // 4. Duplicate Check: One review per trainee per course
    const existingReview = await CourseReview.findOne({
      course: courseId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this course. You can edit your existing review.',
      });
    }

    const review = await CourseReview.create({
      course: courseId,
      user: req.user._id,
      rating: parsedRating,
      comment: typeof comment === 'string' ? comment.trim() : '',
    });

    const populatedReview = await CourseReview.findById(review._id).populate('user', 'name role');

    return res.status(201).json({
      success: true,
      message: 'Review published successfully',
      data: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a review for this course.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Update own course review
 * @route   PUT /api/reviews/:id
 * @access  Private (Review Owner)
 */
const updateCourseReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await CourseReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Ownership check: Trainee can only edit their own review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own review.',
      });
    }

    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (
        !Number.isInteger(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer from 1 to 5.',
        });
      }
      review.rating = parsedRating;
    }

    if (comment !== undefined) {
      review.comment = typeof comment === 'string' ? comment.trim() : '';
    }

    await review.save();

    const populatedReview = await CourseReview.findById(review._id).populate('user', 'name role');

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Review Owner, Admin)
 */
const deleteCourseReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await CourseReview.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.',
      });
    }

    await CourseReview.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseReviews,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
};
