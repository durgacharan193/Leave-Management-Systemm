const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Leave type name is required'],
      trim: true,
      unique: true,
    },
    identifier: {
      type: String,
      required: [true, 'Identifier is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    defaultBalance: {
      type: Number,
      required: [true, 'Default balance is required'],
      min: [0, 'Balance cannot be negative'],
    },
    genderRestrict: {
      type: String,
      enum: ['none', 'male', 'female', 'other'],
      default: 'none',
    },
    color: {
      type: String,
      default: '#818cf8', // Default Indigo color
    },
    icon: {
      type: String,
      default: '🏖️',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
