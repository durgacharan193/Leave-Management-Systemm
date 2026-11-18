const express = require('express');
const router = express.Router();
const {
  getLeaveTypes,
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  leaveTypeValidation,
} = require('../controllers/leaveTypeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

router.get('/', getLeaveTypes);

// Admin only routes
router.use(authorize('admin'));

router.get('/all', getAllLeaveTypes);
router.post('/', leaveTypeValidation, validate, createLeaveType);
router.put('/:id', updateLeaveType);
router.delete('/:id', deleteLeaveType);

module.exports = router;
