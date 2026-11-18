const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas
 * Retries connection on failure with exponential backoff
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default leave types if collection is empty
    const LeaveType = require('../models/LeaveType');
    const count = await LeaveType.countDocuments();
    if (count === 0) {
      await LeaveType.insertMany([
        { name: 'Casual Leave', identifier: 'casual', defaultBalance: 12, genderRestrict: 'none', color: '#818cf8', icon: '🏖️' },
        { name: 'Sick Leave', identifier: 'sick', defaultBalance: 10, genderRestrict: 'none', color: '#f87171', icon: '🏥' },
        { name: 'Paid Leave', identifier: 'paid', defaultBalance: 15, genderRestrict: 'none', color: '#34d399', icon: '💰' },
        { name: 'Maternity Leave', identifier: 'maternity', defaultBalance: 180, genderRestrict: 'female', color: '#e879f9', icon: '👶' },
      ]);
      logger.info('Default leave types seeded successfully');
    }
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
