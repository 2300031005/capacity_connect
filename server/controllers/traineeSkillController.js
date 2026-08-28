const Enrollment = require('../models/Enrollment');
const Competency = require('../models/Competency');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const Certificate = require('../models/Certificate');
const QuizAttempt = require('../models/QuizAttempt');

/**
 * Helper to determine which courses the trainee has fully completed and passed
 * If a course has a published final assessment, trainee MUST have passed it (or earned a certificate).
 */
const getCourseCompletionMap = async (traineeId, courseIds) => {
  // 1. Find all courses among courseIds that have a published final assessment
  const publishedFinalAssessments = await Assessment.find({
    course: { $in: courseIds },
    type: 'final',
    status: 'published',
  }).select('course');

  const coursesWithFinalAssessment = new Set(
    publishedFinalAssessments.map((a) => a.course.toString())
  );

  // 2. Find all passed final assessment attempts or valid certificates for this trainee
  const [passedAttempts, certificates] = await Promise.all([
    QuizAttempt.find({
      trainee: traineeId,
      course: { $in: courseIds },
      type: 'final',
      passed: true,
    }).select('course'),
    Certificate.find({
      trainee: traineeId,
      course: { $in: courseIds },
      status: 'valid',
    }).select('course'),
  ]);

  const coursesWithPassedFinal = new Set([
    ...passedAttempts.map((a) => a.course.toString()),
    ...certificates.map((c) => c.course.toString()),
  ]);

  return {
    coursesWithFinalAssessment,
    coursesWithPassedFinal,
  };
};

/**
 * @desc    Get trainee's learning skill profile (My Skills)
 * @route   GET /api/trainees/me/skills
 * @access  Private / Trainee
 */
const getMySkills = async (req, res, next) => {
  try {
    const traineeId = req.user._id;

    // Fetch trainee enrollments with course and skills populated
    const enrollments = await Enrollment.find({
      trainee: traineeId,
      status: { $in: ['active', 'completed'] },
    }).populate({
      path: 'course',
      select: 'title description category level status skills',
      populate: {
        path: 'skills',
        select: 'name category description isActive',
      },
    });

    const enrolledCourseIds = enrollments
      .map((e) => e.course?._id)
      .filter(Boolean);

    const { coursesWithFinalAssessment, coursesWithPassedFinal } =
      await getCourseCompletionMap(traineeId, enrolledCourseIds);

    const skillMap = {};

    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course || !course.skills || course.skills.length === 0) return;

      const cIdStr = course._id.toString();
      const hasFinalAssessment = coursesWithFinalAssessment.has(cIdStr);
      const hasPassedFinal = coursesWithPassedFinal.has(cIdStr);

      // A course is only completed and skills attained if:
      // - If course has final assessment: Trainee MUST have passed final assessment
      // - If course has no final assessment: Enrollment progress must be 100% and status completed
      const isCourseSkillAttained = hasFinalAssessment
        ? hasPassedFinal
        : enrollment.status === 'completed' && enrollment.progress === 100;

      course.skills.forEach((skill) => {
        if (!skill || !skill._id) return;
        const sId = skill._id.toString();

        if (!skillMap[sId]) {
          skillMap[sId] = {
            _id: skill._id,
            name: skill.name,
            category: skill.category,
            description: skill.description,
            courses: [],
            status: 'Learning',
          };
        }

        skillMap[sId].courses.push({
          courseId: course._id,
          courseTitle: course.title,
          enrollmentStatus: isCourseSkillAttained ? 'completed' : enrollment.status,
          progress: enrollment.progress || 0,
          completedAt: isCourseSkillAttained ? enrollment.completedAt || new Date() : null,
          hasPassedFinal: hasFinalAssessment ? hasPassedFinal : null,
        });

        // Upgrade status to 'Course Completed' if any contributing course has been fully passed
        if (isCourseSkillAttained) {
          skillMap[sId].status = 'Course Completed';
        }
      });
    });

    const skillsList = Object.values(skillMap).sort((a, b) => {
      // Sort Course Completed first, then alphabetically by name
      if (a.status === 'Course Completed' && b.status !== 'Course Completed') return -1;
      if (a.status !== 'Course Completed' && b.status === 'Course Completed') return 1;
      return a.name.localeCompare(b.name);
    });

    return res.status(200).json({
      success: true,
      count: skillsList.length,
      data: skillsList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get trainee's competency progress overview
 * @route   GET /api/trainees/me/competencies
 * @access  Private / Trainee
 */
const getMyCompetencies = async (req, res, next) => {
  try {
    const traineeId = req.user._id;

    // 1. Fetch trainee enrollments and extract skill completion map
    const enrollments = await Enrollment.find({
      trainee: traineeId,
      status: { $in: ['active', 'completed'] },
    }).populate({
      path: 'course',
      select: 'title skills status',
      populate: {
        path: 'skills',
        select: 'name',
      },
    });

    const enrolledCourseIds = enrollments
      .map((e) => e.course?._id)
      .filter(Boolean);

    const { coursesWithFinalAssessment, coursesWithPassedFinal } =
      await getCourseCompletionMap(traineeId, enrolledCourseIds);

    const traineeSkillStatus = {}; // { [skillId]: 'completed' | 'in_progress' }

    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course || !course.skills) return;

      const cIdStr = course._id.toString();
      const hasFinalAssessment = coursesWithFinalAssessment.has(cIdStr);
      const hasPassedFinal = coursesWithPassedFinal.has(cIdStr);

      const isCourseSkillAttained = hasFinalAssessment
        ? hasPassedFinal
        : enrollment.status === 'completed' && enrollment.progress === 100;

      course.skills.forEach((skill) => {
        if (!skill || !skill._id) return;
        const sId = skill._id.toString();

        if (isCourseSkillAttained) {
          traineeSkillStatus[sId] = 'completed';
        } else if (!traineeSkillStatus[sId]) {
          traineeSkillStatus[sId] = 'in_progress';
        }
      });
    });

    // 2. Fetch all active competencies with required skills
    const competencies = await Competency.find({ isActive: true })
      .populate('skills', 'name category description isActive')
      .sort({ name: 1 });

    const competencyOverview = competencies.map((comp) => {
      const requiredSkills = comp.skills || [];
      let completedCount = 0;
      let inProgressCount = 0;

      const evaluatedSkills = requiredSkills.map((skill) => {
        const sId = skill._id.toString();
        const state = traineeSkillStatus[sId] || 'missing';

        if (state === 'completed') completedCount += 1;
        if (state === 'in_progress') inProgressCount += 1;

        return {
          _id: skill._id,
          name: skill.name,
          category: skill.category,
          state, // 'completed' | 'in_progress' | 'missing'
        };
      });

      let status = 'Not Started';
      if (completedCount === requiredSkills.length && requiredSkills.length > 0) {
        status = 'Completed';
      } else if (completedCount > 0 || inProgressCount > 0) {
        status = 'In Progress';
      }

      return {
        _id: comp._id,
        name: comp.name,
        description: comp.description,
        totalRequiredSkills: requiredSkills.length,
        completedSkillsCount: completedCount,
        inProgressSkillsCount: inProgressCount,
        status, // 'Completed' | 'In Progress' | 'Not Started'
        skills: evaluatedSkills,
      };
    });

    return res.status(200).json({
      success: true,
      count: competencyOverview.length,
      data: competencyOverview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMySkills,
  getMyCompetencies,
};
