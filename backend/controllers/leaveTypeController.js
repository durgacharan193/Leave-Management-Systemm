const { body } = require('express-validator');
const LeaveType = require('../models/LeaveType');
const logger = require('../utils/logger');

// Validation rules
const leaveTypeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('identifier').trim().notEmpty().withMessage('Identifier is required').toLowerCase(),
  body('defaultBalance').isInt({ min: 0 }).withMessage('Default balance must be a positive integer'),
  body('genderRestrict').optional().isIn(['none', 'male', 'female', 'other']),
  body('color').optional().matches(/^#([0-9A-Fa-f]{3}){1,2}$/).withMessage('Valid hex color required'),
  body('icon').optional().trim(),
];

/**
 * @desc    Get all active leave types
 * @route   GET /api/leave-types
 * @access  Private
 */
const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true }).sort('createdAt');
    res.status(200).json({
      success: true,
      data: { leaveTypes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ALL leave types (including inactive)
 * @route   GET /api/leave-types/all
 * @access  Private (Admin)
 */
const getAllLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { leaveTypes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new leave type
 * @route   POST /api/leave-types
 * @access  Private (Admin)
 */
const createLeaveType = async (req, res, next) => {
  try {
    const { name, identifier, defaultBalance, genderRestrict, color, icon } = req.body;

    const existing = await LeaveType.findOne({ $or: [{ name }, { identifier }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A leave type with this name or identifier already exists',
      });
    }

    const leaveType = await LeaveType.create({
      name,
      identifier,
      defaultBalance,
      genderRestrict: genderRestrict || 'none',
      color: color || '#818cf8',
      icon: icon || '🏖️',
    });

    logger.info('Leave type created', {
      adminId: req.user._id,
      leaveTypeId: leaveType._id,
      identifier: leaveType.identifier,
    });

    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      data: { leaveType },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a leave type
 * @route   PUT /api/leave-types/:id
 * @access  Private (Admin)
 */
const updateLeaveType = async (req, res, next) => {
  try {
    const { name, identifier, defaultBalance, genderRestrict, color, icon, isActive } = req.body;

    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    if (name) leaveType.name = name;
    if (identifier) leaveType.identifier = identifier;
    if (defaultBalance !== undefined) leaveType.defaultBalance = defaultBalance;
    if (genderRestrict) leaveType.genderRestrict = genderRestrict;
    if (color) leaveType.color = color;
    if (icon) leaveType.icon = icon;
    if (isActive !== undefined) leaveType.isActive = isActive;

    await leaveType.save();

    res.status(200).json({
      success: true,
      message: 'Leave type updated successfully',
      data: { leaveType },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete (soft-delete) a leave type
 * @route   DELETE /api/leave-types/:id
 * @access  Private (Admin)
 */
const deleteLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    leaveType.isActive = false;
    await leaveType.save();

    res.status(200).json({
      success: true,
      message: 'Leave type deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  leaveTypeValidation,
};
