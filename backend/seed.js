const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Leave = require('./models/Leave');

dotenv.config();

/**
 * Database Seed Script
 * Creates default admin, manager, and employee users for testing
 * Uses realistic software company departments and roles
 *
 * Usage: npm run seed
 */
const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Leave.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      gender: 'male',
    });
    console.log(`✅ Admin created: ${admin.email} (${admin.role})`);

    // Create Managers — each heads a department
    const manager1 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.manager@company.com',
      password: 'manager123',
      role: 'manager',
      department: 'Engineering',
      gender: 'female',
    });

    const manager2 = await User.create({
      name: 'Michael Chen',
      email: 'michael.manager@company.com',
      password: 'manager123',
      role: 'manager',
      department: 'Marketing',
      gender: 'male',
    });

    const manager3 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.manager@company.com',
      password: 'manager123',
      role: 'manager',
      department: 'Quality Assurance',
      gender: 'female',
    });

    const manager4 = await User.create({
      name: 'David Wilson',
      email: 'david.manager@company.com',
      password: 'manager123',
      role: 'manager',
      department: 'DevOps',
      gender: 'male',
    });
    console.log('✅ Managers created (Engineering, Marketing, QA, DevOps)');

    // Create Employees — distributed across departments
    const emp1 = await User.create({
      name: 'Alice Williams',
      email: 'alice@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      manager: manager1._id,
      gender: 'female',
    });

    const emp2 = await User.create({
      name: 'Bob Martinez',
      email: 'bob@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      manager: manager1._id,
      gender: 'male',
    });

    const emp3 = await User.create({
      name: 'Carol Davis',
      email: 'carol@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Marketing',
      manager: manager2._id,
      gender: 'female',
    });

    const emp4 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Quality Assurance',
      manager: manager3._id,
      gender: 'male',
    });

    const emp5 = await User.create({
      name: 'Emily Thompson',
      email: 'emily@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'DevOps',
      manager: manager4._id,
      gender: 'female',
    });

    const emp6 = await User.create({
      name: 'James Park',
      email: 'james@company.com',
      password: 'employee123',
      role: 'employee',
      department: 'Engineering',
      manager: manager1._id,
      gender: 'male',
    });
    console.log('✅ Employees created across departments');

    // Create sample leave requests
    const today = new Date();

    await Leave.create([
      {
        employee: emp1._id,
        leaveType: 'casual',
        startDate: new Date(today.getFullYear(), today.getMonth(), 20),
        endDate: new Date(today.getFullYear(), today.getMonth(), 22),
        reason: 'Family vacation',
        status: 'pending',
      },
      {
        employee: emp1._id,
        leaveType: 'sick',
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 10),
        endDate: new Date(today.getFullYear(), today.getMonth() - 1, 11),
        reason: 'Not feeling well',
        status: 'approved',
        reviewedBy: manager1._id,
        reviewComment: 'Get well soon!',
        reviewedAt: new Date(today.getFullYear(), today.getMonth() - 1, 9),
      },
      {
        employee: emp2._id,
        leaveType: 'paid',
        startDate: new Date(today.getFullYear(), today.getMonth(), 15),
        endDate: new Date(today.getFullYear(), today.getMonth(), 18),
        reason: 'Personal work',
        status: 'pending',
      },
      {
        employee: emp3._id,
        leaveType: 'casual',
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 5),
        endDate: new Date(today.getFullYear(), today.getMonth() - 1, 5),
        reason: 'Doctor appointment',
        status: 'rejected',
        reviewedBy: manager2._id,
        reviewComment: 'Important deadline that day, please reschedule',
        reviewedAt: new Date(today.getFullYear(), today.getMonth() - 1, 4),
      },
      {
        employee: emp3._id,
        leaveType: 'sick',
        startDate: new Date(today.getFullYear(), today.getMonth(), 25),
        endDate: new Date(today.getFullYear(), today.getMonth(), 27),
        reason: 'Medical procedure',
        status: 'pending',
      },
      {
        employee: emp4._id,
        leaveType: 'casual',
        startDate: new Date(today.getFullYear(), today.getMonth(), 12),
        endDate: new Date(today.getFullYear(), today.getMonth(), 14),
        reason: 'Wedding in family',
        status: 'pending',
      },
      {
        employee: emp5._id,
        leaveType: 'paid',
        startDate: new Date(today.getFullYear(), today.getMonth() - 1, 20),
        endDate: new Date(today.getFullYear(), today.getMonth() - 1, 22),
        reason: 'Conference attendance',
        status: 'approved',
        reviewedBy: manager4._id,
        reviewComment: 'Approved. Please share learnings with team.',
        reviewedAt: new Date(today.getFullYear(), today.getMonth() - 1, 18),
      },
      {
        employee: emp6._id,
        leaveType: 'sick',
        startDate: new Date(today.getFullYear(), today.getMonth(), 8),
        endDate: new Date(today.getFullYear(), today.getMonth(), 9),
        reason: 'Fever and cold',
        status: 'pending',
      },
    ]);
    console.log('✅ Sample leave requests created');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('      🚀 SEED COMPLETE — LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('  🛡️  ADMIN:');
    console.log('      admin@company.com / admin123');
    console.log('');
    console.log('  👔 MANAGERS:');
    console.log('      sarah.manager@company.com / manager123   (Engineering)');
    console.log('      michael.manager@company.com / manager123 (Marketing)');
    console.log('      priya.manager@company.com / manager123   (Quality Assurance)');
    console.log('      david.manager@company.com / manager123   (DevOps)');
    console.log('');
    console.log('  👤 EMPLOYEES:');
    console.log('      alice@company.com / employee123           (Engineering)');
    console.log('      bob@company.com / employee123             (Engineering)');
    console.log('      carol@company.com / employee123           (Marketing)');
    console.log('      rajesh@company.com / employee123          (Quality Assurance)');
    console.log('      emily@company.com / employee123           (DevOps)');
    console.log('      james@company.com / employee123           (Engineering)');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
