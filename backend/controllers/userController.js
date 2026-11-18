const { body } = require('express-validator');
const User = require('../models/User');
const Leave = require('../models/Leave');
const logger = require('../utils/logger');

/**
 * Validation rules for creating/updating users
 */
const createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be admin, manager, or employee'),
  body('department').optional().trim(),
  body('gender').optional().isIn(['male', 'female', 'other']),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'employee'])
    .withMessage('Role must be admin, manager, or employee'),
  body('department').optional().trim(),
  body('gender').optional().isIn(['male', 'female', 'other']),
];

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      department,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('manager', 'name email')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
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
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      'manager',
      'name email'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's leave stats
    const leaveStats = await Leave.aggregate([
      { $match: { employee: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: { user, leaveStats },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new user (admin)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, manager, gender } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || 'General',
      manager: manager || null,
      gender: gender || 'other',
    });

    logger.info('User created by admin', {
      adminId: req.user._id,
      newUserId: user._id,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          gender: user.gender,
          leaveBalance: user.leaveBalance,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, manager, isActive, leaveBalance, gender } =
      req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (gender) user.gender = gender;
    if (manager !== undefined) user.manager = manager || null;
    if (isActive !== undefined) user.isActive = isActive;
    if (leaveBalance && typeof leaveBalance === 'object') {
      user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };
      user.markModified('leaveBalance');
    }

    await user.save();

    logger.info('User updated by admin', {
      adminId: req.user._id,
      updatedUserId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete user (deactivate)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    user.isActive = false;
    await user.save();

    logger.info('User deactivated by admin', {
      adminId: req.user._id,
      deactivatedUserId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all managers (for dropdown assignment)
 * @route   GET /api/users/managers
 * @access  Private (Admin)
 */
const getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({
      role: 'manager',
      isActive: true,
    }).select('name email department');

    res.status(200).json({
      success: true,
      data: { managers },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getManagers,
  createUserValidation,
  updateUserValidation,
};
