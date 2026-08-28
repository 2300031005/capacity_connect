const Enrollment = require('../models/Enrollment');
const Competency = require('../models/Competency');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const Assessment = require('../models/Assessment');
const Certificate = require('../models/Certificate');
const QuizAttempt = require('../models/QuizAttempt');

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

  // 2. Find all passed final assessment attempts and valid certificates for this trainee
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
 * Helper to extract skill item from course.skills element (supports both new & legacy structures)
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
 * @desc    Get trainee's consolidated learning skill profile (My Skills)
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
        path: 'skills.skill',
        select: 'name category description isActive',
      },
    });

    const enrolledCourseIds = enrollments
      .map((e) => e.course?._id)
      .filter(Boolean);

    const {
      coursesWithFinalAssessment,
      coursesWithPassedFinal,
      attemptsByCourse,
      certsByCourse,
    } = await getCourseCompletionMap(traineeId, enrolledCourseIds);

    const verifiedSkillMap = new Map(); // [skillIdStr] -> Consolidated Skill Object
    const learningSkillMap = new Map(); // [skillIdStr] -> Learning Skill Object

    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course || !Array.isArray(course.skills) || course.skills.length === 0) return;

      const cIdStr = course._id.toString();
      const hasFinalAssessment = coursesWithFinalAssessment.has(cIdStr);
      const hasPassedFinal = coursesWithPassedFinal.has(cIdStr);

      // A course's skills are verified ONLY when:
      // 1. If course has final assessment: trainee passed final assessment
      // 2. If course has no final assessment: enrollment status is completed (100% modules)
      const isCourseVerified = hasFinalAssessment
        ? hasPassedFinal
        : enrollment.status === 'completed' && enrollment.progress === 100;

      const cert = certsByCourse.get(cIdStr);
      const passedAttempt = attemptsByCourse.get(cIdStr);

      course.skills.forEach((rawSkillItem) => {
        const extracted = extractCourseSkillData(rawSkillItem);
        if (!extracted || !extracted.skill || !extracted.skill._id) return;

        const skillIdStr = extracted.skill._id.toString();
        const skillName = extracted.skill.name || 'Standardized Skill';
        const skillCategory = extracted.skill.category || 'Technical';
        const skillDesc = extracted.skill.description || '';
        const courseProficiency = extracted.proficiency; // 'beginner' | 'proficient' | 'advanced'

        if (isCourseVerified) {
          // Trainee successfully earned this skill from this course
          if (!verifiedSkillMap.has(skillIdStr)) {
            verifiedSkillMap.set(skillIdStr, {
              _id: extracted.skill._id,
              name: skillName,
              category: skillCategory,
              description: skillDesc,
              highestProficiency: courseProficiency,
              highestProficiencyLabel: PROFICIENCY_LABEL[courseProficiency],
              rank: PROFICIENCY_RANK[courseProficiency],
              isVerified: true,
              evidence: [],
            });
          }

          const existingRecord = verifiedSkillMap.get(skillIdStr);

          // Retain highest proficiency (Beginner < Proficient < Advanced)
          if (PROFICIENCY_RANK[courseProficiency] > existingRecord.rank) {
            existingRecord.highestProficiency = courseProficiency;
            existingRecord.highestProficiencyLabel = PROFICIENCY_LABEL[courseProficiency];
            existingRecord.rank = PROFICIENCY_RANK[courseProficiency];
          }

          // Attach evidence / proof of work for this course
          const finalScore =
            passedAttempt?.percentage !== undefined
              ? passedAttempt.percentage
              : cert?.percentage !== undefined
              ? cert.percentage
              : 100;

          const earnedDate = cert?.issueDate || passedAttempt?.submittedAt || enrollment.completedAt || new Date();

          // Avoid duplicate evidence from the exact same course
          const hasCourseEvidence = existingRecord.evidence.some(
            (ev) => ev.courseId.toString() === cIdStr
          );

          if (!hasCourseEvidence) {
            existingRecord.evidence.push({
              courseId: course._id,
              courseTitle: course.title,
              proficiencyAwarded: PROFICIENCY_LABEL[courseProficiency],
              finalScore,
              certificateId: cert?.certificateId || null,
              certificateFile: cert?.filePath || null,
              earnedAt: earnedDate,
            });
          }
        } else {
          // In progress / Learning state (not yet verified)
          if (!learningSkillMap.has(skillIdStr)) {
            learningSkillMap.set(skillIdStr, {
              _id: extracted.skill._id,
              name: skillName,
              category: skillCategory,
              description: skillDesc,
              targetProficiency: courseProficiency,
              targetProficiencyLabel: PROFICIENCY_LABEL[courseProficiency],
              courses: [],
            });
          }

          const learningRecord = learningSkillMap.get(skillIdStr);
          learningRecord.courses.push({
            courseId: course._id,
            courseTitle: course.title,
            progress: enrollment.progress || 0,
            hasFinalAssessment,
            finalAssessmentPending: hasFinalAssessment && !hasPassedFinal,
          });
        }
      });
    });

    // Remove any skills from learning list that have already been verified
    const verifiedSkillsList = Array.from(verifiedSkillMap.values()).sort((a, b) => {
      // Sort by rank descending (Advanced first), then name alphabetically
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.name.localeCompare(b.name);
    });

    const learningSkillsList = Array.from(learningSkillMap.values())
      .filter((s) => !verifiedSkillMap.has(s._id.toString()))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Calculate Summary Metrics
    const advancedCount = verifiedSkillsList.filter((s) => s.highestProficiency === 'advanced').length;
    const proficientCount = verifiedSkillsList.filter((s) => s.highestProficiency === 'proficient').length;
    const beginnerCount = verifiedSkillsList.filter((s) => s.highestProficiency === 'beginner').length;

    return res.status(200).json({
      success: true,
      summary: {
        totalVerified: verifiedSkillsList.length,
        advancedCount,
        proficientCount,
        beginnerCount,
        learningCount: learningSkillsList.length,
      },
      verifiedSkills: verifiedSkillsList,
      learningSkills: learningSkillsList,
      // Backward compatibility alias for single list consumers
      data: verifiedSkillsList.map((s) => ({
        ...s,
        status: 'Course Completed',
        courses: s.evidence.map((ev) => ({
          courseId: ev.courseId,
          courseTitle: ev.courseTitle,
          progress: 100,
          status: 'completed',
        })),
      })),
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
        path: 'skills.skill',
        select: 'name category description isActive',
      },
    });

    const enrolledCourseIds = enrollments
      .map((e) => e.course?._id)
      .filter(Boolean);

    const { coursesWithFinalAssessment, coursesWithPassedFinal } =
      await getCourseCompletionMap(traineeId, enrolledCourseIds);

    const verifiedSkillsMap = new Map(); // [skillIdStr] -> { proficiency, label, rank }
    const learningSkillsSet = new Set();

    enrollments.forEach((enrollment) => {
      const course = enrollment.course;
      if (!course || !Array.isArray(course.skills)) return;

      const cIdStr = course._id.toString();
      const hasFinalAssessment = coursesWithFinalAssessment.has(cIdStr);
      const hasPassedFinal = coursesWithPassedFinal.has(cIdStr);

      const isCourseVerified = hasFinalAssessment
        ? hasPassedFinal
        : enrollment.status === 'completed' && enrollment.progress === 100;

      course.skills.forEach((rawSkillItem) => {
        const extracted = extractCourseSkillData(rawSkillItem);
        if (!extracted || !extracted.skill || !extracted.skill._id) return;

        const skillIdStr = extracted.skill._id.toString();
        const proficiency = extracted.proficiency;

        if (isCourseVerified) {
          const currentRank = PROFICIENCY_RANK[proficiency];
          if (!verifiedSkillsMap.has(skillIdStr)) {
            verifiedSkillsMap.set(skillIdStr, {
              proficiency,
              label: PROFICIENCY_LABEL[proficiency],
              rank: currentRank,
            });
          } else {
            const existing = verifiedSkillsMap.get(skillIdStr);
            if (currentRank > existing.rank) {
              existing.proficiency = proficiency;
              existing.label = PROFICIENCY_LABEL[proficiency];
              existing.rank = currentRank;
            }
          }
        } else {
          learningSkillsSet.add(skillIdStr);
        }
      });
    });

    // 2. Fetch all active competencies with required skills
    const competencies = await Competency.find({ isActive: true })
      .populate('skills', 'name category description isActive')
      .sort({ name: 1 });

    const competencyOverview = competencies.map((comp) => {
      const requiredSkills = comp.skills || [];
      let verifiedCount = 0;
      let learningCount = 0;

      const evaluatedSkills = requiredSkills.map((skill) => {
        const sId = skill._id.toString();
        const verifiedInfo = verifiedSkillsMap.get(sId);

        let state = 'missing'; // 'verified' | 'learning' | 'missing'
        let proficiencyLabel = null;

        if (verifiedInfo) {
          state = 'verified';
          proficiencyLabel = verifiedInfo.label;
          verifiedCount += 1;
        } else if (learningSkillsSet.has(sId)) {
          state = 'learning';
          learningCount += 1;
        }

        return {
          _id: skill._id,
          name: skill.name,
          category: skill.category,
          state,
          proficiency: proficiencyLabel,
        };
      });

      const totalRequired = requiredSkills.length;
      const isDemonstrated = totalRequired > 0 && verifiedCount === totalRequired;
      const progressPercentage =
        totalRequired > 0 ? Math.round((verifiedCount / totalRequired) * 100) : 0;

      let status = 'Not Started';
      if (isDemonstrated) {
        status = 'Demonstrated';
      } else if (verifiedCount > 0 || learningCount > 0) {
        status = 'In Progress';
      }

      return {
        _id: comp._id,
        name: comp.name,
        description: comp.description,
        totalRequiredSkills: totalRequired,
        completedSkillsCount: verifiedCount,
        verifiedSkillsCount: verifiedCount,
        inProgressSkillsCount: learningCount,
        progressPercentage,
        status, // 'Demonstrated' | 'In Progress' | 'Not Started'
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
