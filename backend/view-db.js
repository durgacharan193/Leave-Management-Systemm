const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Leave = require('./models/Leave');

dotenv.config();

/**
 * Quick DB viewer — shows all users and leave records
 * Usage: node view-db.js
 */
const viewDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📊 DATABASE OVERVIEW — leave-management');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // --- USERS ---
    const users = await User.find().populate('manager', 'name').lean();
    
    console.log('  👥 USERS (' + users.length + ' total)');
    console.log('  ' + '─'.repeat(90));
    console.log('  ' + 
      'ROLE'.padEnd(12) + 
      'NAME'.padEnd(22) + 
      'DEPARTMENT'.padEnd(22) + 
      'GENDER'.padEnd(10) + 
      'MANAGER'.padEnd(20) +
      'STATUS'
    );
    console.log('  ' + '─'.repeat(90));

    users.forEach(u => {
      const roleIcon = u.role === 'admin' ? '🛡️' : u.role === 'manager' ? '👔' : '👤';
      console.log('  ' + 
        (roleIcon + ' ' + u.role).padEnd(14) + 
        u.name.padEnd(22) + 
        u.department.padEnd(22) + 
        u.gender.padEnd(10) + 
        (u.manager?.name || '—').padEnd(20) +
        (u.isActive ? '✅ Active' : '❌ Inactive')
      );
    });

    // --- LEAVES ---
    const leaves = await Leave.find()
      .populate('employee', 'name department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('\n\n  📝 LEAVE RECORDS (' + leaves.length + ' total)');
    console.log('  ' + '─'.repeat(100));
    console.log('  ' + 
      'STATUS'.padEnd(14) + 
      'EMPLOYEE'.padEnd(20) + 
      'DEPARTMENT'.padEnd(20) + 
      'TYPE'.padEnd(12) + 
      'DATES'.padEnd(24) + 
      'REASON'
    );
    console.log('  ' + '─'.repeat(100));

    leaves.forEach(l => {
      const statusIcon = l.status === 'approved' ? '✅' : l.status === 'rejected' ? '❌' : l.status === 'pending' ? '⏳' : '🚫';
      const start = new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      console.log('  ' + 
        (statusIcon + ' ' + l.status).padEnd(16) + 
        (l.employee?.name || 'N/A').padEnd(20) + 
        (l.employee?.department || 'N/A').padEnd(20) + 
        l.leaveType.padEnd(12) + 
        (start + ' → ' + end).padEnd(24) + 
        l.reason.substring(0, 30)
      );
      if (l.reviewComment) {
        console.log('  ' + ' '.repeat(16) + '💬 Review: ' + l.reviewComment);
      }
    });

    // --- SUMMARY ---
    const statusCounts = {};
    leaves.forEach(l => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });

    console.log('\n\n  📈 SUMMARY');
    console.log('  ' + '─'.repeat(40));
    console.log('  Total Users:    ' + users.length);
    console.log('  Total Leaves:   ' + leaves.length);
    console.log('  ⏳ Pending:      ' + (statusCounts.pending || 0));
    console.log('  ✅ Approved:     ' + (statusCounts.approved || 0));
    console.log('  ❌ Rejected:     ' + (statusCounts.rejected || 0));
    console.log('  🚫 Cancelled:    ' + (statusCounts.cancelled || 0));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

viewDB();
