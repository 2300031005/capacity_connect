const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
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
 * Helper to normalize and extract skill data from course.skills element
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
    String(proficiency).toLowerCase().trim()
  )
    ? String(proficiency).toLowerCase().trim()
    : 'beginner';

  return {
    skill: skillDoc,
    proficiency: normalizedProficiency,
  };
};

/**
 * Helper to check course final assessment completion status for trainee
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
 * @desc    Get authenticated user profile with role-specific system summary
 * @route   GET /api/profile
 * @access  Private (Trainee, Trainer, Admin)
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    let summary = {};

    // ----------------------------------------------------
    // 1. TRAINEE SYSTEM DATA SUMMARY
    // ----------------------------------------------------
    if (user.role === 'trainee') {
      const [enrollments, certificates, quizAttempts, platformCompetencies] = await Promise.all([
        Enrollment.find({ trainee: userId })
          .populate({
            path: 'course',
            select: 'title description category level status skills thumbnail',
            populate: {
              path: 'skills.skill',
              select: 'name category description isActive',
            },
          })
          .sort({ updatedAt: -1 }),
        Certificate.find({ trainee: userId, status: 'valid' })
          .populate('course', 'title category')
          .sort({ issueDate: -1 }),
        QuizAttempt.find({ trainee: userId }).sort({ submittedAt: -1 }),
        Competency.find({ isActive: true }).populate('skills', 'name category description isActive'),
      ]);

      const enrolledCourseIds = enrollments.map((e) => e.course?._id).filter(Boolean);
      const {
        coursesWithFinalAssessment,
        coursesWithPassedFinal,
        attemptsByCourse,
        certsByCourse,
      } = await getCourseCompletionMap(userId, enrolledCourseIds);

      // Evaluate verified skills
      const verifiedSkillMap = new Map();

      enrollments.forEach((enrollment) => {
        const course = enrollment.course;
        if (!course || !Array.isArray(course.skills) || course.skills.length === 0) return;

        const cIdStr = course._id.toString();
        const hasFinalAssessment = coursesWithFinalAssessment.has(cIdStr);
        const hasPassedFinal = coursesWithPassedFinal.has(cIdStr);

        const isCourseVerified = hasFinalAssessment
          ? hasPassedFinal
          : enrollment.status === 'completed' && enrollment.progress === 100;

        if (isCourseVerified) {
          const cert = certsByCourse.get(cIdStr);
          const passedAttempt = attemptsByCourse.get(cIdStr);

          course.skills.forEach((rawSkillItem) => {
            const extracted = extractCourseSkillData(rawSkillItem);
            if (!extracted || !extracted.skill || !extracted.skill._id) return;

            const skillIdStr = extracted.skill._id.toString();
            const skillName = extracted.skill.name || 'Standardized Skill';
            const skillCategory = extracted.skill.category || 'Technical';
            const courseProficiency = extracted.proficiency;

            if (!verifiedSkillMap.has(skillIdStr)) {
              verifiedSkillMap.set(skillIdStr, {
                _id: extracted.skill._id,
                name: skillName,
                category: skillCategory,
                proficiency: courseProficiency,
                proficiencyLabel: PROFICIENCY_LABEL[courseProficiency],
                rank: PROFICIENCY_RANK[courseProficiency],
                verifiedAt: cert?.issueDate || passedAttempt?.submittedAt || enrollment.completedAt || new Date(),
              });
            } else {
              const existing = verifiedSkillMap.get(skillIdStr);
              if (PROFICIENCY_RANK[courseProficiency] > existing.rank) {
                existing.proficiency = courseProficiency;
                existing.proficiencyLabel = PROFICIENCY_LABEL[courseProficiency];
                existing.rank = PROFICIENCY_RANK[courseProficiency];
              }
            }
          });
        }
      });

      const verifiedSkillsList = Array.from(verifiedSkillMap.values()).sort(
        (a, b) => b.rank - a.rank || a.name.localeCompare(b.name)
      );

      const verifiedSkillIdSet = new Set(Array.from(verifiedSkillMap.keys()));

      // Evaluate platform competencies
      const evaluatedCompetencies = platformCompetencies.map((comp) => {
        const requiredSkills = comp.skills || [];
        const totalRequired = requiredSkills.length;
        if (totalRequired === 0) {
          return {
            _id: comp._id,
            name: comp.name,
            description: comp.description,
            progressPercentage: 0,
            acquiredCount: 0,
            totalRequired: 0,
            status: 'In Progress',
          };
        }

        const acquiredCount = requiredSkills.filter((sk) =>
          verifiedSkillIdSet.has(sk._id.toString())
        ).length;

        const progressPercentage = Math.round((acquiredCount / totalRequired) * 100);
        const status = progressPercentage === 100 ? 'Demonstrated' : 'In Progress';

        return {
          _id: comp._id,
          name: comp.name,
          description: comp.description,
          progressPercentage,
          acquiredCount,
          totalRequired,
          status,
        };
      });

      const demonstratedCompetencies = evaluatedCompetencies.filter((c) => c.status === 'Demonstrated');
      const inProgressCompetencies = evaluatedCompetencies.filter(
        (c) => c.status === 'In Progress' && c.acquiredCount > 0
      );

      // Achievement metrics
      const completedEnrollments = enrollments.filter(
        (e) => e.status === 'completed' || e.progress === 100
      );
      const activeEnrollments = enrollments.filter(
        (e) => e.status === 'active' && e.progress > 0 && e.progress < 100
      );

      const overallProgressPct =
        enrollments.length > 0
          ? Math.round(
              enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
            )
          : 0;

      const avgAssessmentScore =
        quizAttempts.length > 0
          ? Math.round(
              quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizAttempts.length
            )
          : 0;

      // Recent certificates (top 5)
      const recentCertificates = certificates.slice(0, 5).map((c) => ({
        certificateId: c.certificateId,
        courseId: c.course?._id,
        courseTitle: c.course?.title || 'Certified Course',
        percentage: c.percentage,
        issueDate: c.issueDate || c.issuedAt,
        filePath: c.filePath,
      }));

      summary = {
        role: 'trainee',
        overview: {
          coursesCompleted: completedEnrollments.length,
          coursesInProgress: activeEnrollments.length,
          totalEnrolled: enrollments.length,
          certificatesEarned: certificates.length,
          verifiedSkillsCount: verifiedSkillsList.length,
          competenciesDemonstrated: demonstratedCompetencies.length,
          competenciesInProgress: inProgressCompetencies.length,
          overallProgress: overallProgressPct,
        },
        learningSnapshot: {
          activeCourses: activeEnrollments.length,
          completedCourses: completedEnrollments.length,
          averageAssessment: avgAssessmentScore,
          certificatesCount: certificates.length,
          overallProgress: overallProgressPct,
        },
        verifiedSkills: verifiedSkillsList,
        competencies: evaluatedCompetencies,
        recentCertificates,
      };
    }

    // ----------------------------------------------------
    // 2. TRAINER SYSTEM DATA SUMMARY
    // ----------------------------------------------------
    else if (user.role === 'trainer') {
      const courses = await Course.find({ trainer: userId })
        .select('title category level status enrolledCount createdAt')
        .sort({ createdAt: -1 });

      const courseIds = courses.map((c) => c._id);

      const [enrollments, certificates, quizAttempts, reviews] = await Promise.all([
        Enrollment.find({ course: { $in: courseIds } }),
        Certificate.find({ course: { $in: courseIds }, status: 'valid' }),
        QuizAttempt.find({ course: { $in: courseIds } }),
        CourseReview.find({ course: { $in: courseIds } }),
      ]);

      const publishedCourses = courses.filter((c) => c.status === 'published');
      const draftCourses = courses.filter((c) => c.status === 'draft');

      const uniqueLearners = new Set(
        enrollments.map((e) => e.trainee?.toString()).filter(Boolean)
      );

      const completedEnrollments = enrollments.filter(
        (e) => e.status === 'completed' || e.progress === 100
      );

      const completionRate =
        enrollments.length > 0
          ? Math.round((completedEnrollments.length / enrollments.length) * 100)
          : 0;

      const avgAssessmentScore =
        quizAttempts.length > 0
          ? Math.round(
              quizAttempts.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizAttempts.length
            )
          : 0;

      const avgRating =
        reviews.length > 0
          ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
          : 0;

      summary = {
        role: 'trainer',
        teachingOverview: {
          coursesCreated: courses.length,
          publishedCourses: publishedCourses.length,
          draftCourses: draftCourses.length,
          totalLearners: uniqueLearners.size,
          certificatesIssued: certificates.length,
        },
        performanceSummary: {
          totalLearners: uniqueLearners.size,
          totalEnrollments: enrollments.length,
          completionRate,
          averageRating: avgRating,
          averageAssessmentScore: avgAssessmentScore,
          certificatesIssued: certificates.length,
        },
      };
    }

    // ----------------------------------------------------
    // 3. ADMIN SYSTEM DATA SUMMARY
    // ----------------------------------------------------
    else if (user.role === 'admin') {
      const [totalUsers, traineesCount, trainersCount, totalCourses, totalEnrollments, totalCertificates] =
        await Promise.all([
          User.countDocuments({}),
          User.countDocuments({ role: 'trainee' }),
          User.countDocuments({ role: 'trainer' }),
          Course.countDocuments({}),
          Enrollment.countDocuments({}),
          Certificate.countDocuments({ status: 'valid' }),
        ]);

      summary = {
        role: 'admin',
        platformSnapshot: {
          totalUsers,
          traineesCount,
          trainersCount,
          totalCourses,
          totalEnrollments,
          totalCertificates,
        },
      };
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
      summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user-managed profile information
 * @route   PUT /api/profile
 * @access  Private (Authenticated User)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const {
      name,
      phone,
      location,
      bio,
      education,
      experience,
      interests,
      careerGoal,
      designation,
      organization,
      yearsOfExperience,
      professionalBackground,
      teachingInterests,
    } = req.body;

    // 1. Basic user-managed fields validation
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty',
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      const trimmedPhone = phone ? String(phone).trim() : '';
      if (trimmedPhone) {
        // Validate phone format allowing digits, spaces, plus, hyphens, and parenthesis
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
        if (!phoneRegex.test(trimmedPhone)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid phone number (e.g., +1 555-0199 or 9876543210)',
          });
        }
      }
      user.phone = trimmedPhone;
    }

    if (location !== undefined) {
      user.location = location ? String(location).trim() : '';
    }

    if (bio !== undefined) {
      user.bio = bio ? String(bio).trim() : '';
    }

    if (careerGoal !== undefined) {
      user.careerGoal = careerGoal ? String(careerGoal).trim() : '';
    }

    // 2. Education validation & update
    if (education !== undefined) {
      if (!Array.isArray(education)) {
        return res.status(400).json({
          success: false,
          message: 'Education entries must be provided as a list',
        });
      }

      const validatedEducation = [];
      for (let i = 0; i < education.length; i++) {
        const item = education[i];
        if (!item || typeof item !== 'object') continue;

        const qual = item.qualification ? String(item.qualification).trim() : '';
        const inst = item.institution ? String(item.institution).trim() : '';

        if (!qual || !inst) {
          return res.status(400).json({
            success: false,
            message: `Education entry #${i + 1} requires both a Qualification/Degree and an Institution.`,
          });
        }

        const startYr = item.startYear !== undefined && item.startYear !== null && item.startYear !== ''
          ? Number(item.startYear)
          : null;
        const endYr = item.endYear !== undefined && item.endYear !== null && item.endYear !== ''
          ? Number(item.endYear)
          : null;

        if (startYr !== null && isNaN(startYr)) {
          return res.status(400).json({
            success: false,
            message: `Education entry #${i + 1} has an invalid start year.`,
          });
        }

        if (endYr !== null && isNaN(endYr)) {
          return res.status(400).json({
            success: false,
            message: `Education entry #${i + 1} has an invalid end year.`,
          });
        }

        if (startYr !== null && endYr !== null && startYr > endYr) {
          return res.status(400).json({
            success: false,
            message: `Education entry #${i + 1}: Start year (${startYr}) cannot be later than end year (${endYr}).`,
          });
        }

        validatedEducation.push({
          qualification: qual,
          institution: inst,
          fieldOfStudy: item.fieldOfStudy ? String(item.fieldOfStudy).trim() : '',
          startYear: startYr,
          endYear: endYr,
          description: item.description ? String(item.description).trim() : '',
        });
      }

      user.education = validatedEducation;
    }

    // 3. Work Experience validation & update
    if (experience !== undefined) {
      if (!Array.isArray(experience)) {
        return res.status(400).json({
          success: false,
          message: 'Experience entries must be provided as a list',
        });
      }

      const validatedExperience = [];
      for (let i = 0; i < experience.length; i++) {
        const item = experience[i];
        if (!item || typeof item !== 'object') continue;

        const title = item.jobTitle ? String(item.jobTitle).trim() : '';
        const org = item.organization ? String(item.organization).trim() : '';

        if (!title || !org) {
          return res.status(400).json({
            success: false,
            message: `Experience entry #${i + 1} requires both a Job Title and Organization name.`,
          });
        }

        const isCurrent = Boolean(item.isCurrent);
        const startDate = item.startDate ? String(item.startDate).trim() : '';
        const endDate = isCurrent ? '' : item.endDate ? String(item.endDate).trim() : '';

        validatedExperience.push({
          jobTitle: title,
          organization: org,
          employmentType: item.employmentType ? String(item.employmentType).trim() : 'Full-time',
          startDate,
          endDate,
          isCurrent,
          description: item.description ? String(item.description).trim() : '',
        });
      }

      user.experience = validatedExperience;
    }

    // 4. Interests update
    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        return res.status(400).json({
          success: false,
          message: 'Interests must be an array of topic tags',
        });
      }

      user.interests = interests
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0);
    }

    // 5. Trainer specific fields
    if (designation !== undefined) {
      user.designation = designation ? String(designation).trim() : '';
    }

    if (organization !== undefined) {
      user.organization = organization ? String(organization).trim() : '';
    }

    if (yearsOfExperience !== undefined) {
      const expNum = Number(yearsOfExperience);
      if (isNaN(expNum) || expNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Years of experience must be a non-negative number',
        });
      }
      user.yearsOfExperience = expNum;
    }

    if (professionalBackground !== undefined) {
      user.professionalBackground = professionalBackground
        ? String(professionalBackground).trim()
        : '';
    }

    if (teachingInterests !== undefined) {
      if (!Array.isArray(teachingInterests)) {
        return res.status(400).json({
          success: false,
          message: 'Teaching interests must be an array of topic tags',
        });
      }

      user.teachingInterests = teachingInterests
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or replace profile avatar photo
 * @route   POST /api/profile/photo
 * @access  Private (Authenticated User)
 */
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload as your profile photo.',
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // If user already had a previously uploaded local avatar, remove old file from disk
    if (user.photo && user.photo.startsWith('/uploads/profiles/')) {
      const oldFilename = path.basename(user.photo);
      const oldFilePath = path.join(__dirname, '../uploads/profiles', oldFilename);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.warn('Could not clean up old profile avatar file:', err.message);
      }
    }

    const publicPhotoUrl = `/uploads/profiles/${req.file.filename}`;
    user.photo = publicPhotoUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      photo: publicPhotoUrl,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove profile photo (reset to default)
 * @route   DELETE /api/profile/photo
 * @access  Private (Authenticated User)
 */
const removeProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // If local file exists, remove from disk
    if (user.photo && user.photo.startsWith('/uploads/profiles/')) {
      const oldFilename = path.basename(user.photo);
      const oldFilePath = path.join(__dirname, '../uploads/profiles', oldFilename);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.warn('Could not clean up removed avatar file:', err.message);
      }
    }

    user.photo = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully',
      photo: '',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
};
