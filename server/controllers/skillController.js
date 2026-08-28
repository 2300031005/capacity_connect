const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const Course = require('../models/Course');
const Competency = require('../models/Competency');

/**
 * @desc    Get skills list with filtering
 * @route   GET /api/skills
 * @access  Public / Authenticated
 */
const getSkills = async (req, res, next) => {
  try {
    const { category, search, status, all } = req.query;
    const query = {};

    // If requester is not admin, strictly return active skills
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || all !== 'true') {
      query.isActive = true;
    }

    if (isAdmin && status) {
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
    }

    if (category && category.trim() && category !== 'All') {
      query.category = category.trim();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const skills = await Skill.find(query).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single skill by ID
 * @route   GET /api/skills/:id
 * @access  Public / Authenticated
 */
const getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID' });
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    return res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new skill (Admin only)
 * @route   POST /api/skills
 * @access  Private / Admin
 */
const createSkill = async (req, res, next) => {
  try {
    const { name, description, category, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a skill name' });
    }

    const normalizedName = name.toLowerCase().trim();
    const existing = await Skill.findOne({ normalizedName });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A skill with name "${existing.name}" already exists in the Skill Library.`,
      });
    }

    const newSkill = await Skill.create({
      name: name.trim(),
      normalizedName,
      description: description ? description.trim() : '',
      category: category || 'Technical',
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: newSkill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update skill (Admin only)
 * @route   PUT /api/skills/:id
 * @access  Private / Admin
 */
const updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID' });
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const { name, description, category, isActive } = req.body;

    if (name && name.trim()) {
      const normalizedName = name.toLowerCase().trim();
      const duplicate = await Skill.findOne({
        normalizedName,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another skill with name "${duplicate.name}" already exists.`,
        });
      }

      skill.name = name.trim();
      skill.normalizedName = normalizedName;
    }

    if (description !== undefined) skill.description = description.trim();
    if (category) skill.category = category;
    if (isActive !== undefined) skill.isActive = isActive;

    await skill.save();

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle skill active/inactive status (Admin only)
 * @route   PATCH /api/skills/:id/status
 * @access  Private / Admin
 */
const toggleSkillStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID' });
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    skill.isActive = !skill.isActive;
    await skill.save();

    return res.status(200).json({
      success: true,
      message: `Skill ${skill.isActive ? 'activated' : 'deactivated'} successfully`,
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete skill (Admin only - prevents deletion if referenced)
 * @route   DELETE /api/skills/:id
 * @access  Private / Admin
 */
const deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid skill ID' });
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // Integrity check: Is this skill referenced in courses or competencies?
    const courseRef = await Course.findOne({ skills: id }).select('title');
    if (courseRef) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete skill because it is referenced in course "${courseRef.title}". Please deactivate the skill instead.`,
      });
    }

    const competencyRef = await Competency.findOne({ skills: id }).select('name');
    if (competencyRef) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete skill because it is referenced in competency "${competencyRef.name}". Please deactivate the skill instead.`,
      });
    }

    await Skill.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  toggleSkillStatus,
  deleteSkill,
};
