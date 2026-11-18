const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getManagers,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/userController');

// All user routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/users/managers
 * @desc    Get all managers (for dropdown)
 * @access  Private (Admin)
 */
router.get('/managers', getManagers);

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private (Admin)
 */
router.get('/', getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (Admin)
 */
router.get('/:id', getUser);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post('/', createUserValidation, validate, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', updateUserValidation, validate, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft-delete (deactivate) user
 * @access  Private (Admin)
 */
router.delete('/:id', deleteUser);

module.exports = router;
