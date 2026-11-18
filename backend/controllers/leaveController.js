const { body } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Validation rules for applying leave
 */
const LeaveType = require('../models/LeaveType');
const applyLeaveValidation = [
  body('leaveType')
    .trim()
    .notEmpty()
    .withMessage('Leave type is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

/**
 * Validation rules for reviewing leave
 */
const reviewLeaveValidation = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('reviewComment')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Review comment cannot exceed 300 characters'),
];

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee)
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date',
      });
    }

    // Calculate duration
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Get leave type from DB
    const leaveTypeDoc = await LeaveType.findOne({ identifier: leaveType, isActive: true });
    if (!leaveTypeDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive leave type',
      });
    }

    const user = await User.findById(req.user._id);

    // Enforce gender restrictions
    if (leaveTypeDoc.genderRestrict !== 'none' && user.gender !== leaveTypeDoc.genderRestrict) {
      return res.status(400).json({
        success: false,
        message: `${leaveTypeDoc.name} is only available for ${leaveTypeDoc.genderRestrict} employees`,
      });
    }

    // Lazy load balance if missing
    let currentBalance = user.leaveBalance && user.leaveBalance[leaveType] !== undefined 
      ? user.leaveBalance[leaveType] 
      : leaveTypeDoc.defaultBalance;

    if (currentBalance < duration) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveTypeDoc.name} balance. Available: ${currentBalance}, Requested: ${duration}`,
      });
    }

    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      employee: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request overlapping with these dates',
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      employeeName: user.name,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    });

    logger.info('Leave applied', {
      userId: req.user._id,
      leaveId: leave._id,
      type: leaveType,
      duration,
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's leave history
 * @route   GET /api/leaves/my
 * @access  Private (Employee)
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      leaveType,
      sort = '-createdAt',
    } = req.query;

    const query = { employee: req.user._id };

    // Apply filters
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending leave request
 * @route   PATCH /api/leaves/:id/cancel
 * @access  Private (Employee — own leave only)
 */
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    // Ensure the leave belongs to the current user
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave that is already ${leave.status}`,
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    logger.info('Leave cancelled', {
      userId: req.user._id,
      leaveId: leave._id,
    });

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get team leave requests (employees under this manager)
 * @route   GET /api/leaves/team
 * @access  Private (Manager)
 */
const getTeamLeaves = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      leaveType,
      sort = '-createdAt',
    } = req.query;

    // Find all employees assigned to this manager
    const teamMembers = await User.find({ manager: req.user._id }).select(
      '_id'
    );
    const teamIds = teamMembers.map((m) => m._id);

    const query = { employee: { $in: teamIds } };

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a leave request
 * @route   PATCH /api/leaves/:id/review
 * @access  Private (Manager, Admin)
 */
const reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewComment } = req.body;

    const leave = await Leave.findById(req.params.id).populate(
      'employee',
      'name email leaveBalance'
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot review a leave that is already ${leave.status}`,
      });
    }

    // If manager, verify the employee belongs to their team
    if (req.user.role === 'manager') {
      const employee = await User.findById(leave.employee._id);
      if (
        !employee.manager ||
        employee.manager.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only review leave requests from your team members',
        });
      }
    }

    // Update leave status
    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComment = reviewComment || '';
    leave.reviewedAt = new Date();
    await leave.save();

    // If approved, deduct leave balance
    if (status === 'approved') {
      const duration =
        Math.ceil(
          (leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)
        ) + 1;

      await User.findByIdAndUpdate(leave.employee._id, {
        $inc: { [`leaveBalance.${leave.leaveType}`]: -duration },
      });
    }

    logger.info('Leave reviewed', {
      reviewerId: req.user._id,
      leaveId: leave._id,
      status,
    });

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: { leave },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leave records (admin view)
 * @route   GET /api/leaves
 * @access  Private (Admin)
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      leaveType,
      employee,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employee) query.employee = employee;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave statistics for dashboard
 * @route   GET /api/leaves/stats
 * @access  Private (Admin, Manager)
 */
const getLeaveStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    // If manager, only show team stats
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ manager: req.user._id }).select(
        '_id'
      );
      const teamIds = teamMembers.map((m) => m._id);
      matchQuery = { employee: { $in: teamIds } };
    }

    // If employee, show own stats
    if (req.user.role === 'employee') {
      matchQuery = { employee: req.user._id };
    }

    const stats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Leave.aggregate([
      {
        $match: {
          ...matchQuery,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format stats into an object
    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    stats.forEach((s) => {
      formattedStats[s._id] = s.count;
      formattedStats.total += s.count;
    });

    const formattedTypeStats = {};
    typeStats.forEach((s) => {
      formattedTypeStats[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      data: {
        statusStats: formattedStats,
        typeStats: formattedTypeStats,
        monthlyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getTeamLeaves,
  reviewLeave,
  getAllLeaves,
  getLeaveStats,
  applyLeaveValidation,
  reviewLeaveValidation,
};
