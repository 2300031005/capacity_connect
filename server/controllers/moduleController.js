const fs = require('fs');
const Module = require('../models/Module');
const Resource = require('../models/Resource');
const { verifyCourseAccess } = require('../utils/courseOwnership');

/**
 * @desc    Create a new module for a course
 * @route   POST /api/courses/:courseId/modules
 * @access  Private (Owner Trainer, Admin)
 */
const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    const check = await verifyCourseAccess(courseId, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Module title is required',
      });
    }

    // Auto-calculate order if not supplied
    let moduleOrder = order;
    if (!moduleOrder || isNaN(moduleOrder)) {
      const highestModule = await Module.findOne({ course: courseId }).sort({ order: -1 });
      moduleOrder = highestModule ? highestModule.order + 1 : 1;
    }

    const newModule = await Module.create({
      course: courseId,
      title: title.trim(),
      description: description ? description.trim() : '',
      order: moduleOrder,
    });

    return res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: newModule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all modules for a course
 * @route   GET /api/courses/:courseId/modules
 * @access  Public / Authenticated
 */
const getModules = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const modules = await Module.find({ course: courseId }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing module
 * @route   PUT /api/modules/:id
 * @access  Private (Owner Trainer, Admin)
 */
const updateModule = async (req, res, next) => {
  try {
    const moduleItem = await Module.findById(req.params.id);
    if (!moduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    const check = await verifyCourseAccess(moduleItem.course, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    const { title, description, order } = req.body;
    if (title && title.trim()) moduleItem.title = title.trim();
    if (description !== undefined) moduleItem.description = description.trim();
    if (order !== undefined && !isNaN(order)) moduleItem.order = Number(order);

    await moduleItem.save();

    return res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: moduleItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a module and its associated resources
 * @route   DELETE /api/modules/:id
 * @access  Private (Owner Trainer, Admin)
 */
const deleteModule = async (req, res, next) => {
  try {
    const moduleItem = await Module.findById(req.params.id);
    if (!moduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    const check = await verifyCourseAccess(moduleItem.course, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    // Delete resource files in this module
    const resources = await Resource.find({ module: moduleItem._id });
    for (const resItem of resources) {
      if (resItem.filePath && fs.existsSync(resItem.filePath)) {
        try {
          fs.unlinkSync(resItem.filePath);
        } catch (unlinkErr) {
          console.warn(`Could not delete file ${resItem.filePath}:`, unlinkErr.message);
        }
      }
    }

    await Resource.deleteMany({ module: moduleItem._id });
    await Module.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Module and associated resources deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update module sort order
 * @route   PATCH /api/modules/:id/order
 * @access  Private (Owner Trainer, Admin)
 */
const updateModuleOrder = async (req, res, next) => {
  try {
    const { order } = req.body;
    if (order === undefined || isNaN(order)) {
      return res.status(400).json({
        success: false,
        message: 'Valid order number is required',
      });
    }

    const moduleItem = await Module.findById(req.params.id);
    if (!moduleItem) {
      return res.status(404).json({
        success: false,
        message: 'Module not found',
      });
    }

    const check = await verifyCourseAccess(moduleItem.course, req.user);
    if (!check.authorized) {
      return res.status(check.statusCode).json({
        success: false,
        message: check.message,
      });
    }

    moduleItem.order = Number(order);
    await moduleItem.save();

    return res.status(200).json({
      success: true,
      message: 'Module order updated',
      data: moduleItem,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createModule,
  getModules,
  updateModule,
  deleteModule,
  updateModuleOrder,
};
