const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Leave = require('./models/Leave');

dotenv.config();

/**
 * Database Reset Script
 * Completely wipes all leaves and employees formatting the application fresh.
 * Leaves ONLY the core system Admin account so you can log in.
 */
const resetDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Wipe everything
    await Leave.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Wiped all previous history, leaves, and users.');

    // 2. Create foundational System Admin so user can log in
    await User.create({
      name: 'System Admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      gender: 'male'
    });
    console.log('✅ Created fresh System Admin account.');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('    ✨ APPLICATION RESET SUCCESSFUL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('The application is now completely fresh.');
    console.log('All previous leaves and employees are gone.');
    console.log('\nTo get started, log in with:');
    console.log('Email:    admin@company.com');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error.message);
    process.exit(1);
  }
};

resetDB();
