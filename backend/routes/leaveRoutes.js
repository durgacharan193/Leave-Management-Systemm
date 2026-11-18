const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  getTeamLeaves,
  reviewLeave,
  getAllLeaves,
  getLeaveStats,
  applyLeaveValidation,
  reviewLeaveValidation,
} = require('../controllers/leaveController');

// All leave routes require authentication
router.use(protect);

/**
 * @route   GET /api/leaves/stats
 * @desc    Get leave statistics for dashboard
 * @access  Private (All roles)
 */
router.get('/stats', getLeaveStats);

/**
 * @route   GET /api/leaves/my
 * @desc    Get current user's leave history
 * @access  Private (Employee)
 */
router.get('/my', getMyLeaves);

/**
 * @route   GET /api/leaves/team
 * @desc    Get team leave requests
 * @access  Private (Manager)
 */
router.get('/team', authorize('manager'), getTeamLeaves);

/**
 * @route   GET /api/leaves
 * @desc    Get all leave records
 * @access  Private (Admin)
 */
router.get('/', authorize('admin'), getAllLeaves);

/**
 * @route   POST /api/leaves
 * @desc    Apply for leave
 * @access  Private (Employee, Manager)
 */
router.post(
  '/',
  authorize('employee', 'manager'),
  applyLeaveValidation,
  validate,
  applyLeave
);

/**
 * @route   PATCH /api/leaves/:id/cancel
 * @desc    Cancel a pending leave request
 * @access  Private (Employee — own leave only)
 */
router.patch('/:id/cancel', cancelLeave);

/**
 * @route   PATCH /api/leaves/:id/review
 * @desc    Approve or reject a leave request
 * @access  Private (Manager, Admin)
 */
router.patch(
  '/:id/review',
  authorize('manager', 'admin'),
  reviewLeaveValidation,
  validate,
  reviewLeave
);

module.exports = router;
