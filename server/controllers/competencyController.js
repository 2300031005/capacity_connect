const mongoose = require('mongoose');
const Competency = require('../models/Competency');
const Skill = require('../models/Skill');

/**
 * @desc    Get all competencies
 * @route   GET /api/competencies
 * @access  Public / Authenticated
 */
const getCompetencies = async (req, res, next) => {
  try {
    const { search, status, all } = req.query;
    const query = {};

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || all !== 'true') {
      query.isActive = true;
    }

    if (isAdmin && status) {
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const competencies = await Competency.find(query)
      .populate('skills', 'name category description isActive')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: competencies.length,
      data: competencies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get competency by ID
 * @route   GET /api/competencies/:id
 * @access  Public / Authenticated
 */
const getCompetencyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid competency ID' });
    }

    const competency = await Competency.findById(id).populate(
      'skills',
      'name category description isActive'
    );

    if (!competency) {
      return res.status(404).json({ success: false, message: 'Competency not found' });
    }

    return res.status(200).json({
      success: true,
      data: competency,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new competency (Admin only)
 * @route   POST /api/competencies
 * @access  Private / Admin
 */
const createCompetency = async (req, res, next) => {
  try {
    const { name, description, skills, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a competency name' });
    }

    const existing = await Competency.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Competency "${existing.name}" already exists.`,
      });
    }

    // Validate skills array
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A competency must reference at least one required skill.',
      });
    }

    // Ensure all skills are valid ObjectIds and exist in database
    for (const skillId of skills) {
      if (!mongoose.Types.ObjectId.isValid(skillId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid Skill ID: "${skillId}".`,
        });
      }
    }

    const validSkillsCount = await Skill.countDocuments({
      _id: { $in: skills },
      isActive: true,
    });

    if (validSkillsCount !== skills.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected skills do not exist or are inactive.',
      });
    }

    const newCompetency = await Competency.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      skills,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedCompetency = await Competency.findById(newCompetency._id).populate(
      'skills',
      'name category description isActive'
    );

    return res.status(201).json({
      success: true,
      message: 'Competency created successfully',
      data: populatedCompetency,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update competency (Admin only)
 * @route   PUT /api/competencies/:id
 * @access  Private / Admin
 */
const updateCompetency = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid competency ID' });
    }

    const competency = await Competency.findById(id);
    if (!competency) {
      return res.status(404).json({ success: false, message: 'Competency not found' });
    }

    const { name, description, skills, isActive } = req.body;

    if (name && name.trim()) {
      const duplicate = await Competency.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another competency with name "${duplicate.name}" already exists.`,
        });
      }
      competency.name = name.trim();
    }

    if (description !== undefined) competency.description = description.trim();
    if (isActive !== undefined) competency.isActive = isActive;

    if (skills !== undefined) {
      if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'A competency must reference at least one required skill.',
        });
      }

      for (const skillId of skills) {
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid Skill ID: "${skillId}".`,
          });
        }
      }

      const validSkillsCount = await Skill.countDocuments({
        _id: { $in: skills },
      });

      if (validSkillsCount !== skills.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected skills do not exist in the Skill Library.',
        });
      }

      competency.skills = skills;
    }

    await competency.save();

    const updatedCompetency = await Competency.findById(id).populate(
      'skills',
      'name category description isActive'
    );

    return res.status(200).json({
      success: true,
      message: 'Competency updated successfully',
      data: updatedCompetency,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle competency status (Admin only)
 * @route   PATCH /api/competencies/:id/status
 * @access  Private / Admin
 */
const toggleCompetencyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid competency ID' });
    }

    const competency = await Competency.findById(id);
    if (!competency) {
      return res.status(404).json({ success: false, message: 'Competency not found' });
    }

    competency.isActive = !competency.isActive;
    await competency.save();

    return res.status(200).json({
      success: true,
      message: `Competency ${competency.isActive ? 'activated' : 'deactivated'} successfully`,
      data: competency,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete competency (Admin only)
 * @route   DELETE /api/competencies/:id
 * @access  Private / Admin
 */
const deleteCompetency = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid competency ID' });
    }

    const competency = await Competency.findByIdAndDelete(id);
    if (!competency) {
      return res.status(404).json({ success: false, message: 'Competency not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Competency deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompetencies,
  getCompetencyById,
  createCompetency,
  updateCompetency,
  toggleCompetencyStatus,
  deleteCompetency,
};
