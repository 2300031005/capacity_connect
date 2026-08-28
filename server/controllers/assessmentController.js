const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { generateCertificatePDF, generateCertificateId } = require('../utils/certificateGenerator');

/**
 * Helper to sanitize assessment questions for Trainee (strip correctOption)
 */
const sanitizeQuestionsForTrainee = (questions) => {
  return questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    marks: q.marks,
  }));
};

/**
 * @desc    Get module quiz (trainee receives sanitized questions, trainer gets full quiz)
 * @route   GET /api/modules/:moduleId/quiz
 * @access  Private (Enrolled Trainee, Owner Trainer, Admin)
 */
const getModuleQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const course = await Course.findById(moduleDoc.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const quiz = await Assessment.findOne({ module: moduleId, type: 'module' });
    if (!quiz) {
      return res.status(200).json({ success: true, data: null });
    }

    // Role-based access control
    if (req.user.role === 'trainee') {
      const enrollment = await Enrollment.findOne({
        trainee: req.user._id,
        course: course._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You must be enrolled in this course to access the quiz.',
        });
      }

      if (quiz.status !== 'published') {
        return res.status(200).json({ success: true, data: null });
      }

      // Fetch Trainee's latest attempt if exists
      const latestAttempt = await QuizAttempt.findOne({
        trainee: req.user._id,
        assessment: quiz._id,
      }).sort({ createdAt: -1 });

      const sanitizedQuiz = quiz.toObject();
      sanitizedQuiz.questions = sanitizeQuestionsForTrainee(quiz.questions);

      return res.status(200).json({
        success: true,
        data: {
          quiz: sanitizedQuiz,
          latestAttempt,
        },
      });
    }

    // Trainer access: ownership verification
    if (req.user.role === 'trainer') {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view quizzes for courses you instruct.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        quiz,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update module quiz
 * @route   POST /api/modules/:moduleId/quiz
 * @access  Private (Owner Trainer, Admin)
 */
const saveModuleQuiz = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { title, description, questions, status, passingPercentage } = req.body;

    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const course = await Course.findById(moduleDoc.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Ownership check
    if (req.user.role === 'trainer') {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only create quizzes for your own courses.',
        });
      }
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Quiz title is required' });
    }

    if (status === 'published' && (!questions || questions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish quiz with 0 questions. Please add at least 1 question.',
      });
    }

    const passPct =
      passingPercentage !== undefined
        ? Math.max(0, Math.min(100, parseInt(passingPercentage, 10) || 0))
        : 50;

    let quiz = await Assessment.findOne({ module: moduleId, type: 'module' });

    if (quiz) {
      quiz.title = title.trim();
      quiz.description = description ? description.trim() : '';
      quiz.passingPercentage = passPct;
      if (questions) quiz.questions = questions;
      if (status) quiz.status = status;
      await quiz.save();
    } else {
      quiz = await Assessment.create({
        course: course._id,
        module: moduleId,
        type: 'module',
        title: title.trim(),
        description: description ? description.trim() : '',
        passingPercentage: passPct,
        questions: questions || [],
        status: status || 'draft',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Module quiz saved successfully',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get final course assessment
 * @route   GET /api/courses/:courseId/final-assessment
 * @access  Private (Enrolled Trainee, Owner Trainer, Admin)
 */
const getFinalAssessment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const assessment = await Assessment.findOne({ course: courseId, type: 'final' });
    if (!assessment) {
      return res.status(200).json({ success: true, data: null });
    }

    // Role-based access control
    if (req.user.role === 'trainee') {
      const enrollment = await Enrollment.findOne({
        trainee: req.user._id,
        course: course._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You must be enrolled in this course to access the final assessment.',
        });
      }

      if (assessment.status !== 'published') {
        return res.status(200).json({ success: true, data: null });
      }

      // Check for trainee certificate & attempts
      const certificate = await Certificate.findOne({
        trainee: req.user._id,
        course: courseId,
      })
        .populate('trainee', 'name email')
        .populate('course', 'title')
        .populate('trainer', 'name');

      const latestAttempt = await QuizAttempt.findOne({
        trainee: req.user._id,
        assessment: assessment._id,
      }).sort({ createdAt: -1 });

      // Check module completion gating
      const courseModules = await Module.find({ course: course._id }).select('_id');
      const completedSet = new Set(
        (enrollment.completedModules || []).map((id) => id.toString())
      );
      const allModulesCompleted =
        courseModules.length === 0 ||
        courseModules.every((mod) => completedSet.has(mod._id.toString()));

      const sanitizedAssessment = assessment.toObject();
      sanitizedAssessment.questions = sanitizeQuestionsForTrainee(assessment.questions);

      return res.status(200).json({
        success: true,
        data: {
          assessment: sanitizedAssessment,
          latestAttempt,
          certificate,
          isLocked: !allModulesCompleted,
          totalModules: courseModules.length,
          completedCount: completedSet.size,
          gatingMessage: !allModulesCompleted
            ? 'Complete all required course modules before attempting the final assessment.'
            : null,
        },
      });
    }

    // Trainer ownership verification
    if (req.user.role === 'trainer') {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view assessments for courses you instruct.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        assessment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update final course assessment
 * @route   POST /api/courses/:courseId/final-assessment
 * @access  Private (Owner Trainer, Admin)
 */
const saveFinalAssessment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, passingPercentage, questions, status } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Ownership check
    if (req.user.role === 'trainer') {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only create assessments for your own courses.',
        });
      }
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assessment title is required' });
    }

    const passPct = passingPercentage !== undefined ? parseInt(passingPercentage, 10) : 60;
    if (isNaN(passPct) || passPct < 0 || passPct > 100) {
      return res.status(400).json({
        success: false,
        message: 'Passing percentage must be an integer between 0 and 100.',
      });
    }

    if (status === 'published' && (!questions || questions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish assessment with 0 questions. Please add at least 1 question.',
      });
    }

    let assessment = await Assessment.findOne({ course: courseId, type: 'final' });

    if (assessment) {
      assessment.title = title.trim();
      assessment.description = description ? description.trim() : '';
      assessment.passingPercentage = passPct;
      if (questions) assessment.questions = questions;
      if (status) assessment.status = status;
      await assessment.save();
    } else {
      assessment = await Assessment.create({
        course: courseId,
        module: null,
        type: 'final',
        title: title.trim(),
        description: description ? description.trim() : '',
        passingPercentage: passPct,
        questions: questions || [],
        status: status || 'draft',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Final assessment saved successfully',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete assessment (Module Quiz or Final Assessment)
 * @route   DELETE /api/assessments/:id
 * @access  Private (Owner Trainer, Admin)
 */
const deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const course = await Course.findById(assessment.course);
    if (req.user.role === 'trainer' && course) {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    await Assessment.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle assessment status (draft/published)
 * @route   PUT /api/assessments/:id/status
 * @access  Private (Owner Trainer, Admin)
 */
const toggleAssessmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const course = await Course.findById(assessment.course);
    if (req.user.role === 'trainer' && course) {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const nextStatus = assessment.status === 'published' ? 'draft' : 'published';
    if (nextStatus === 'published' && (!assessment.questions || assessment.questions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish assessment without questions.',
      });
    }

    assessment.status = nextStatus;
    await assessment.save();

    return res.status(200).json({
      success: true,
      message: `Assessment status updated to ${nextStatus}`,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit attempt for a module quiz or final assessment
 * @route   POST /api/assessments/:id/attempt
 * @access  Private (Enrolled Trainee only)
 */
const submitAssessmentAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOption }
    const traineeId = req.user._id;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (assessment.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit attempt for an unpublished assessment.',
      });
    }

    const course = await Course.findById(assessment.course).populate('trainer', 'name email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      trainee: traineeId,
      course: course._id,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course to take this assessment.',
      });
    }

    // Final Assessment Gating Enforcement (Backend Authority)
    if (assessment.type === 'final') {
      const courseModules = await Module.find({ course: course._id }).select('_id');
      const completedSet = new Set(
        (enrollment.completedModules || []).map((id) => id.toString())
      );
      const allModulesCompleted =
        courseModules.length === 0 ||
        courseModules.every((mod) => completedSet.has(mod._id.toString()));

      if (!allModulesCompleted) {
        return res.status(403).json({
          success: false,
          isLocked: true,
          message: 'Complete all required course modules before attempting the final assessment.',
          data: {
            totalModules: courseModules.length,
            completedModules: completedSet.size,
          },
        });
      }
    }

    // Evaluate answers
    let score = 0;
    let totalMarks = 0;
    const processedAnswers = [];

    const submittedMap = {};
    if (Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans.questionId) {
          submittedMap[ans.questionId.toString()] = (ans.selectedOption || '').toUpperCase().trim();
        }
      });
    }

    assessment.questions.forEach((q) => {
      const qId = q._id.toString();
      const qMarks = q.marks || 1;
      totalMarks += qMarks;

      const selected = submittedMap[qId] || '';
      const correct = q.correctOption.toUpperCase().trim();
      const isCorrect = selected === correct;

      if (isCorrect) {
        score += qMarks;
      }

      processedAnswers.push({
        question: q._id,
        questionText: q.questionText,
        selectedOption: selected,
        correctOption: correct,
        isCorrect,
        marksAwarded: isCorrect ? qMarks : 0,
      });
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passThreshold = assessment.passingPercentage || (assessment.type === 'final' ? 60 : 50);
    const passed = percentage >= passThreshold;

    // Create Attempt Record
    const attempt = await QuizAttempt.create({
      trainee: traineeId,
      assessment: assessment._id,
      course: course._id,
      module: assessment.module,
      type: assessment.type,
      answers: processedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
      submittedAt: new Date(),
    });

    let certificateData = null;

    // 1. AUTOMATIC MODULE COMPLETION (For Module Quizzes)
    if (assessment.type === 'module' && assessment.module) {
      const currentCompleted = enrollment.completedModules
        ? enrollment.completedModules.map((m) => m.toString())
        : [];

      if (!currentCompleted.includes(assessment.module.toString())) {
        currentCompleted.push(assessment.module.toString());
        enrollment.completedModules = currentCompleted;

        const totalModules = await Module.countDocuments({ course: course._id });
        const progress =
          totalModules > 0 ? Math.round((currentCompleted.length / totalModules) * 100) : 0;
        enrollment.progress = Math.min(100, Math.max(0, progress));

        // If course has no final assessment, 100% progress completes the course
        const hasPublishedFinal = await Assessment.exists({
          course: course._id,
          type: 'final',
          status: 'published',
        });

        if (enrollment.progress === 100 && !hasPublishedFinal) {
          enrollment.status = 'completed';
          enrollment.completedAt = new Date();
        }
        await enrollment.save();
      }
    }

    // 2. AUTOMATIC CERTIFICATE GENERATION & COURSE COMPLETION (For Passed Final Assessment)
    if (assessment.type === 'final' && passed) {
      // Mark enrollment as completed upon passing final assessment
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      await enrollment.save();

      let existingCert = await Certificate.findOne({
        trainee: traineeId,
        course: course._id,
      });

      if (!existingCert) {
        const certificateId = generateCertificateId();
        const traineeUser = await User.findById(traineeId);

        const filePath = await generateCertificatePDF({
          certificateId,
          traineeName: traineeUser?.name || 'Trainee',
          courseTitle: course.title,
          trainerName: course.trainer?.name || 'Course Instructor',
          percentage,
          issuedAt: new Date(),
        });

        existingCert = await Certificate.create({
          certificateId,
          trainee: traineeId,
          course: course._id,
          trainer: course.trainer?._id || course.trainer,
          assessment: assessment._id,
          score,
          totalMarks,
          percentage,
          issuedAt: new Date(),
          filePath,
          status: 'valid',
        });
      }

      certificateData = existingCert;
    }

    return res.status(201).json({
      success: true,
      message:
        assessment.type === 'final'
          ? passed
            ? 'Congratulations! You passed the final assessment.'
            : 'Assessment submitted. You did not meet the passing criteria.'
          : 'Module quiz submitted and module completed!',
      data: {
        attempt,
        certificate: certificateData,
        progress: enrollment.progress,
        isModuleCompleted: assessment.type === 'module',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trainee attempts for an assessment
 * @route   GET /api/assessments/:id/my-attempts
 * @access  Private (Enrolled Trainee only)
 */
const getMyAssessmentAttempts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const traineeId = req.user._id;

    const attempts = await QuizAttempt.find({
      trainee: traineeId,
      assessment: id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course assessment results roster for Trainer
 * @route   GET /api/courses/:courseId/trainer-results
 * @access  Private (Owner Trainer, Admin)
 */
const getCourseAssessmentResults = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'trainer') {
      const isOwner =
        course.trainer.toString() === req.user._id.toString() ||
        course.trainer.toString() === req.user.id;
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const enrollments = await Enrollment.find({ course: courseId }).populate(
      'trainee',
      'name email department'
    );

    const moduleQuizzes = await Assessment.find({ course: courseId, type: 'module' });
    const finalAssessment = await Assessment.findOne({ course: courseId, type: 'final' });

    // Aggregate attempts for each trainee
    const results = await Promise.all(
      enrollments.map(async (e) => {
        const traineeId = e.trainee?._id;

        // Module Quiz Attempts
        const moduleAttempts = await QuizAttempt.find({
          trainee: traineeId,
          course: courseId,
          type: 'module',
        });

        const totalModuleScore = moduleAttempts.reduce((sum, a) => sum + a.percentage, 0);
        const moduleQuizAvg =
          moduleAttempts.length > 0 ? Math.round(totalModuleScore / moduleAttempts.length) : null;

        // Final Assessment Attempt
        let finalAttempt = null;
        if (finalAssessment) {
          finalAttempt = await QuizAttempt.findOne({
            trainee: traineeId,
            assessment: finalAssessment._id,
          }).sort({ createdAt: -1 });
        }

        const certificate = await Certificate.findOne({
          trainee: traineeId,
          course: courseId,
        });

        return {
          traineeId: e.trainee?._id,
          name: e.trainee?.name || 'Learner',
          email: e.trainee?.email || 'N/A',
          department: e.trainee?.department || 'N/A',
          progress: e.progress || 0,
          moduleQuizzesAttempted: moduleAttempts.length,
          moduleQuizAvg,
          finalScore: finalAttempt ? finalAttempt.percentage : null,
          finalPassed: finalAttempt ? finalAttempt.passed : null,
          hasCertificate: Boolean(certificate),
          certificateId: certificate?.certificateId || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
        },
        moduleQuizzesCount: moduleQuizzes.length,
        hasFinalAssessment: Boolean(finalAssessment),
        learners: results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trainee's centralized assessments feed (Available & Completed across enrolled courses)
 * @route   GET /api/assessments/my-feed
 * @access  Private (Trainee only)
 */
const getMyAssessmentsFeed = async (req, res, next) => {
  try {
    const traineeId = req.user._id;

    // Find all active/completed enrollments for this trainee
    const enrollments = await Enrollment.find({ trainee: traineeId }).populate({
      path: 'course',
      select: 'title category level status trainer',
      populate: { path: 'trainer', select: 'name email department' },
    });

    const availableAssessments = [];
    const completedAssessments = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      if (!course || course.status !== 'published') continue;

      const courseModules = await Module.find({ course: course._id }).sort({ order: 1 });
      const completedSet = new Set(
        (enrollment.completedModules || []).map((id) => id.toString())
      );
      const allModulesCompleted =
        courseModules.length === 0 ||
        courseModules.every((mod) => completedSet.has(mod._id.toString()));

      // 1. Module Quizzes for this course
      for (const mod of courseModules) {
        const quiz = await Assessment.findOne({
          course: course._id,
          module: mod._id,
          type: 'module',
          status: 'published',
        });

        if (quiz && quiz.questions && quiz.questions.length > 0) {
          const latestAttempt = await QuizAttempt.findOne({
            trainee: traineeId,
            $or: [{ assessment: quiz._id }, { module: mod._id }],
          }).sort({ createdAt: -1 });

          const totalMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
          const passThreshold = quiz.passingPercentage || 50;

          if (latestAttempt) {
            completedAssessments.push({
              _id: quiz._id,
              type: 'module',
              title: quiz.title || `${mod.title} Quiz`,
              courseId: course._id,
              courseTitle: course.title,
              moduleId: mod._id,
              moduleTitle: mod.title,
              questionCount: quiz.questions.length,
              totalMarks,
              passThreshold,
              latestAttempt: {
                _id: latestAttempt._id,
                score: latestAttempt.score,
                totalMarks: latestAttempt.totalMarks,
                percentage: latestAttempt.percentage,
                passed: latestAttempt.passed,
                createdAt: latestAttempt.createdAt,
              },
            });
          } else {
            availableAssessments.push({
              _id: quiz._id,
              type: 'module',
              title: quiz.title || `${mod.title} Quiz`,
              courseId: course._id,
              courseTitle: course.title,
              moduleId: mod._id,
              moduleTitle: mod.title,
              questionCount: quiz.questions.length,
              totalMarks,
              passThreshold,
              isLocked: false,
            });
          }
        }
      }

      // 2. Final Course Assessment
      const finalAssessment = await Assessment.findOne({
        course: course._id,
        type: 'final',
        status: 'published',
      });

      if (finalAssessment && finalAssessment.questions && finalAssessment.questions.length > 0) {
        const latestAttempt = await QuizAttempt.findOne({
          trainee: traineeId,
          $or: [{ assessment: finalAssessment._id }, { course: course._id, type: 'final' }],
        }).sort({ createdAt: -1 });

        const certificate = await Certificate.findOne({
          trainee: traineeId,
          course: course._id,
        })
          .populate('trainee', 'name email')
          .populate('course', 'title')
          .populate('trainer', 'name');

        const totalMarks = finalAssessment.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        const passThreshold = finalAssessment.passingPercentage || 60;

        if (latestAttempt) {
          completedAssessments.push({
            _id: finalAssessment._id,
            type: 'final',
            title: finalAssessment.title || `${course.title} Final Assessment`,
            courseId: course._id,
            courseTitle: course.title,
            questionCount: finalAssessment.questions.length,
            totalMarks,
            passThreshold,
            certificate: certificate || null,
            latestAttempt: {
              _id: latestAttempt._id,
              score: latestAttempt.score,
              totalMarks: latestAttempt.totalMarks,
              percentage: latestAttempt.percentage,
              passed: latestAttempt.passed,
              createdAt: latestAttempt.createdAt,
            },
          });
        } else {
          availableAssessments.push({
            _id: finalAssessment._id,
            type: 'final',
            title: finalAssessment.title || `${course.title} Final Assessment`,
            courseId: course._id,
            courseTitle: course.title,
            questionCount: finalAssessment.questions.length,
            totalMarks,
            passThreshold,
            isLocked: !allModulesCompleted,
            totalModules: courseModules.length,
            completedModules: completedSet.size,
          });
        }
      }
    }

    console.log(
      `[GET /api/assessments/my-feed] Trainee: ${req.user.name || traineeId} | Available: ${availableAssessments.length} | Completed: ${completedAssessments.length}`
    );

    return res.status(200).json({
      success: true,
      data: {
        availableAssessments,
        completedAssessments,
      },
    });
  } catch (error) {
    console.error('[GET /api/assessments/my-feed] Error:', error);
    next(error);
  }
};

/**
 * @desc    Get trainer's centralized assessments overview across all their courses
 * @route   GET /api/assessments/trainer-overview
 * @access  Private (Owner Trainer, Admin)
 */
const getTrainerAssessmentsOverview = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { trainer: req.user._id };
    const courses = await Course.find(query).sort({ createdAt: -1 });

    const courseIds = courses.map((c) => c._id);
    const assessments = await Assessment.find({ course: { $in: courseIds } })
      .populate('module', 'title order')
      .populate('course', 'title status');

    const overview = await Promise.all(
      assessments.map(async (ass) => {
        const attempts = await QuizAttempt.find({ assessment: ass._id });
        const passedCount = attempts.filter((a) => a.passed).length;
        const avgScore =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
            : null;

        return {
          _id: ass._id,
          title: ass.title,
          type: ass.type,
          status: ass.status,
          courseId: ass.course?._id,
          courseTitle: ass.course?.title,
          moduleTitle: ass.module?.title || null,
          questionCount: ass.questions?.length || 0,
          totalMarks: ass.questions?.reduce((sum, q) => sum + (q.marks || 1), 0) || 0,
          passingPercentage: ass.passingPercentage || (ass.type === 'final' ? 60 : 50),
          totalAttempts: attempts.length,
          passedCount,
          avgScore,
          updatedAt: ass.updatedAt,
        };
      })
    );

    console.log(
      `[GET /api/assessments/trainer-overview] User: ${req.user.name} | Assessments: ${overview.length}`
    );

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('[GET /api/assessments/trainer-overview] Error:', error);
    next(error);
  }
};

/**
 * @desc    Get assessment by ID (Sanitized for trainee)
 * @route   GET /api/assessments/:id
 * @access  Private (Authenticated)
 */
const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`[GET /api/assessments/${id}] Requested by: ${req.user.email} (${req.user.role})`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`[GET /api/assessments/${id}] Invalid ObjectId format`);
      return res.status(400).json({ success: false, message: 'Invalid assessment ID format' });
    }

    const assessment = await Assessment.findById(id)
      .populate('course', 'title trainer')
      .populate('module', 'title order');
    if (!assessment) {
      console.warn(`[GET /api/assessments/${id}] Assessment not found in database`);
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (req.user.role === 'trainee') {
      const enrollment = await Enrollment.findOne({
        trainee: req.user._id,
        course: assessment.course._id,
      });

      if (!enrollment) {
        console.warn(`[GET /api/assessments/${id}] Trainee ${req.user.email} not enrolled in course ${assessment.course._id}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied. You must be enrolled in this course to view this assessment.',
        });
      }

      if (assessment.status !== 'published') {
        return res.status(403).json({
          success: false,
          message: 'Assessment is not published.',
        });
      }

      const latestAttempt = await QuizAttempt.findOne({
        trainee: req.user._id,
        $or: [{ assessment: assessment._id }, { module: assessment.module?._id }],
      }).sort({ createdAt: -1 });

      const sanitized = assessment.toObject();
      sanitized.questions = sanitizeQuestionsForTrainee(assessment.questions);

      console.log(`[GET /api/assessments/${id}] Success -> Title: "${sanitized.title}" (${sanitized.questions.length} Qs)`);

      return res.status(200).json({
        success: true,
        data: {
          assessment: sanitized,
          latestAttempt,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        assessment,
      },
    });
  } catch (error) {
    console.error(`[GET /api/assessments/${req.params.id}] Error:`, error);
    next(error);
  }
};

module.exports = {
  getModuleQuiz,
  saveModuleQuiz,
  getFinalAssessment,
  saveFinalAssessment,
  deleteAssessment,
  toggleAssessmentStatus,
  submitAssessmentAttempt,
  getMyAssessmentAttempts,
  getCourseAssessmentResults,
  getMyAssessmentsFeed,
  getTrainerAssessmentsOverview,
  getAssessmentById,
};
