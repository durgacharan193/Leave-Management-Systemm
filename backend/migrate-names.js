const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Leave = mongoose.connection.db.collection('leaves');
    const User = mongoose.connection.db.collection('users');
    
    const leaves = await Leave.find({}).toArray();
    for(const l of leaves) {
      if (!l.employeeName) {
        const u = await User.findOne({_id: l.employee});
        if(u) {
          await Leave.updateOne({_id: l._id}, {$set: {employeeName: u.name}});
        }
      }
    }
    console.log('Successfully added names to all existing leaves');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
migrate();
