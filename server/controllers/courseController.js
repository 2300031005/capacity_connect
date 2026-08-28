const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Resource = require('../models/Resource');
const Enrollment = require('../models/Enrollment');
const Skill = require('../models/Skill');
const { verifyCourseAccess } = require('../utils/courseOwnership');

/**
 * Helper to validate and sanitize skills array with proficiency level
 */
const validateAndFormatCourseSkills = async (skillsInput, defaultLevel = 'beginner') => {
  if (!Array.isArray(skillsInput)) {
    throw new Error('Skills must be provided as an array.');
  }

  const validProficiencies = ['beginner', 'proficient', 'advanced'];
  const formatted = [];

  for (const item of skillsInput) {
    let skillId;
    let proficiency = defaultLevel || 'beginner';

    if (item && typeof item === 'object' && !mongoose.Types.ObjectId.isValid(item)) {
      skillId = item.skill || item.skillId || item._id;
      if (item.proficiency && validProficiencies.includes(item.proficiency.toLowerCase().trim())) {
        proficiency = item.proficiency.toLowerCase().trim();
      }
    } else {
      skillId = item;
    }

    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) {
      throw new Error(`Invalid Skill ID: "${skillId}".`);
    }

    formatted.push({
      skill: new mongoose.Types.ObjectId(skillId),
      proficiency,
    });
  }

  // Deduplicate by skill ID
  const uniqueMap = new Map();
  formatted.forEach((item) => {
    uniqueMap.set(item.skill.toString(), item);
  });
  const uniqueFormatted = Array.from(uniqueMap.values());
  const uniqueSkillIds = uniqueFormatted.map((f) => f.skill);

  // Check all exist and are active in Skill model
  const activeCount = await Skill.countDocuments({
    _id: { $in: uniqueSkillIds },
    isActive: true,
  });

  if (activeCount !== uniqueSkillIds.length) {
    throw new Error('One or more selected skills do not exist or are inactive.');
  }

  return uniqueFormatted;
};

/**
 * Helper to normalize populated skills on course objects
 */
const normalizePopulatedCourse = (courseDoc) => {
  if (!courseDoc) return courseDoc;
  const courseObj = courseDoc.toObject ? courseDoc.toObject() : { ...courseDoc };

  if (Array.isArray(courseObj.skills)) {
    courseObj.skills = courseObj.skills.map((item) => {
      if (item && item.skill && typeof item.skill === 'object') {
        return {
          _id: item.skill._id,
          name: item.skill.name || '',
          category: item.skill.category || 'Technical',
          description: item.skill.description || '',
          isActive: item.skill.isActive !== undefined ? item.skill.isActive : true,
          proficiency: item.proficiency || 'beginner',
          skill: item.skill,
        };
      }
      if (item && item._id) {
        return {
          _id: item._id,
          name: item.name || '',
          category: item.category || 'Technical',
          description: item.description || '',
          isActive: item.isActive !== undefined ? item.isActive : true,
          proficiency: 'beginner',
          skill: item,
        };
      }
      return item;
    });
  }

  return courseObj;
};

/**
 * @desc    Get courses list (Catalog for public/trainees, or own courses for trainers)
 * @route   GET /api/courses
 * @access  Public / Optional Auth
 */
const getCourses = async (req, res, next) => {
  try {
    const { category, level, search, mine, status } = req.query;
    const query = {};

    // Filter by Trainer's own courses
    if (mine === 'true' && req.user) {
      if (req.user.role === 'trainer') {
        query.trainer = req.user._id;
      }
      if (status) {
        query.status = status;
      }
    } else if (req.user && req.user.role === 'admin' && mine === 'all') {
      // Admin viewing all courses including drafts
      if (status) {
        query.status = status;
      }
    } else {
      // Public / Trainee catalog: strictly published courses
      query.status = 'published';
    }

    // Category filter
    if (category && category.trim()) {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Level filter
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level.toLowerCase().trim())) {
      query.level = level.toLowerCase().trim();
    }

    // Keyword search on title, description, category
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const courses = await Course.find(query)
      .populate('trainer', 'name email department')
      .populate('skills.skill', 'name category description isActive')
      .populate('skills', 'name category description isActive')
      .sort({ createdAt: -1 });

    // Attach module count to each course
    const courseIds = courses.map((c) => c._id);
    const moduleCounts = await Module.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]);

    const moduleCountMap = {};
    moduleCounts.forEach((item) => {
      moduleCountMap[item._id.toString()] = item.count;
    });

    // Check enrollment status if user is a trainee
    const enrollmentMap = {};
    if (req.user && req.user.role === 'trainee') {
      const userEnrollments = await Enrollment.find({
        trainee: req.user._id,
        course: { $in: courseIds },
      }).select('course status progress');

      userEnrollments.forEach((e) => {
        enrollmentMap[e.course.toString()] = e;
      });
    }

    const coursesWithCount = courses.map((course) => {
      const courseObj = normalizePopulatedCourse(course);
      courseObj.moduleCount = moduleCountMap[course._id.toString()] || 0;
      const userEnrollment = enrollmentMap[course._id.toString()];
      courseObj.isEnrolled = Boolean(userEnrollment);
      courseObj.enrollmentProgress = userEnrollment ? userEnrollment.progress : 0;
      return courseObj;
    });

    return res.status(200).json({
      success: true,
      count: coursesWithCount.length,
      data: coursesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed course information with modules and resources
 * @route   GET /api/courses/:id
 * @access  Public / Authenticated
 */
const getCourseById = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    const courseDoc = await Course.findById(courseId)
      .populate('trainer', 'name email department')
      .populate('skills.skill', 'name category description isActive')
      .populate('skills', 'name category description isActive');

    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const course = normalizePopulatedCourse(courseDoc);

    // If course is draft, ensure viewer is the owner trainer or admin
    if (course.status === 'draft') {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'This course is currently in draft mode and not available publicly.',
        });
      }

      const isOwner = course.trainer._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to view this draft course.',
        });
      }
    }

    // Determine if the user has authorization to access module learning content
    let isEnrolled = false;
    let enrollment = null;
    let canAccessResources = false;

    if (req.user) {
      if (req.user.role === 'admin') {
        canAccessResources = true;
      } else if (req.user.role === 'trainer') {
        const isOwner =
          course.trainer._id.toString() === req.user._id.toString() ||
          course.trainer._id.toString() === req.user.id;
        if (isOwner) {
          canAccessResources = true;
        }
      } else if (req.user.role === 'trainee') {
        enrollment = await Enrollment.findOne({
          trainee: req.user._id,
          course: courseId,
          status: { $in: ['active', 'completed'] },
        });
        isEnrolled = Boolean(enrollment);
        if (isEnrolled) {
          canAccessResources = true;
        }
      }
    }

    // Fetch modules sorted by order ASC
    const modules = await Module.find({ course: courseId }).sort({ order: 1 });

    let modulesWithResources = [];

    if (canAccessResources) {
      // Fetch resources grouped by module only for authorized users (Admin, Owner Trainer, Enrolled Trainee)
      const resources = await Resource.find({ course: courseId }).sort({ createdAt: 1 });

      const resourcesByModule = {};
      resources.forEach((resource) => {
        const modId = resource.module.toString();
        if (!resourcesByModule[modId]) {
          resourcesByModule[modId] = [];
        }
        resourcesByModule[modId].push(resource);
      });

      modulesWithResources = modules.map((mod) => {
        const modObj = mod.toObject();
        modObj.resources = resourcesByModule[mod._id.toString()] || [];
        return modObj;
      });
    } else {
      // For unauthenticated or non-enrolled trainees: return modules WITHOUT leaking resource data
      modulesWithResources = modules.map((mod) => {
        const modObj = mod.toObject();
        modObj.resources = [];
        return modObj;
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        course,
        modules: modulesWithResources,
        isEnrolled,
        enrollment,
        canAccessResources,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course (Draft)
 * @route   POST /api/courses
 * @access  Private (Trainer, Admin)
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, level, thumbnail, prerequisites, skills } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Course description is required',
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Course category is required',
      });
    }

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    const chosenLevel = level ? level.toLowerCase().trim() : 'beginner';

    if (!validLevels.includes(chosenLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid difficulty level (beginner, intermediate, advanced)',
      });
    }

    // Validate skills if provided
    let verifiedSkills = [];
    if (skills !== undefined && skills !== null) {
      try {
        verifiedSkills = await validateAndFormatCourseSkills(skills, chosenLevel);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Invalid skills selection.',
        });
      }
    }

    // Automatically bind the current authenticated trainer/admin as owner
    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level: chosenLevel,
      trainer: req.user._id,
      thumbnail: thumbnail || '',
      prerequisites: prerequisites ? prerequisites.trim() : '',
      skills: verifiedSkills,
      status: 'draft',
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('trainer', 'name email department')
      .populate('skills.skill', 'name category description isActive')
      .populate('skills', 'name category description isActive');

    return res.status(201).json({
      success: true,
      message: 'Course created successfully as draft',
      data: normalizePopulatedCourse(populatedCourse),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course basic details
 * @route   PUT /api/courses/:id
 * @access  Private (Owner Trainer, Admin)
 */
const updateCourse = async (req, res, next) => {
  try {
    const check = await verifyCourseAccess(req.params.id, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    const { title, description, category, level, thumbnail, prerequisites, skills } = req.body;
    const course = check.course;

    if (title && title.trim()) course.title = title.trim();
    if (description && description.trim()) course.description = description.trim();
    if (category && category.trim()) course.category = category.trim();
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level.toLowerCase().trim())) {
      course.level = level.toLowerCase().trim();
    }
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (prerequisites !== undefined) course.prerequisites = prerequisites.trim();

    if (skills !== undefined && skills !== null) {
      try {
        const formattedSkills = await validateAndFormatCourseSkills(
          skills,
          course.level || 'beginner'
        );
        course.skills = formattedSkills;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Invalid skills selection.',
        });
      }
    }

    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate('trainer', 'name email department')
      .populate('skills.skill', 'name category description isActive')
      .populate('skills', 'name category description isActive');

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: normalizePopulatedCourse(updatedCourse),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish a draft course (Requires at least 1 module)
 * @route   PATCH /api/courses/:id/publish
 * @access  Private (Owner Trainer, Admin)
 */
const publishCourse = async (req, res, next) => {
  try {
    const check = await verifyCourseAccess(req.params.id, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    const course = check.course;

    // Check if course has at least one module
    const moduleCount = await Module.countDocuments({ course: course._id });

    if (moduleCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course must contain at least one module before publishing.',
      });
    }

    // Toggle status or publish
    const targetStatus = req.body.status || (course.status === 'published' ? 'draft' : 'published');
    course.status = targetStatus;
    await course.save();

    return res.status(200).json({
      success: true,
      message: `Course ${course.status === 'published' ? 'published' : 'moved to draft'} successfully`,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a course and all associated modules, resources, and enrollments
 * @route   DELETE /api/courses/:id
 * @access  Private (Owner Trainer, Admin)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const check = await verifyCourseAccess(req.params.id, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    const courseId = req.params.id;

    // Delete local files associated with resources
    const resources = await Resource.find({ course: courseId });
    for (const resItem of resources) {
      if (resItem.filePath && fs.existsSync(resItem.filePath)) {
        try {
          fs.unlinkSync(resItem.filePath);
        } catch (unlinkErr) {
          console.warn(`Could not delete file ${resItem.filePath}:`, unlinkErr.message);
        }
      }
    }

    // Cascade delete resources, modules, and enrollments
    await Resource.deleteMany({ course: courseId });
    await Module.deleteMany({ course: courseId });
    await Enrollment.deleteMany({ course: courseId });
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: 'Course and all associated content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  publishCourse,
  deleteCourse,
};
