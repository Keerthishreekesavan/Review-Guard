const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const deleteUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const result = await User.deleteOne({ email });

    if (result.deletedCount === 1) {
      console.log(`Successfully deleted user: ${email}`);
    } else {
      console.log(`User not found: ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  }
};

deleteUser('keytreeseaaa@gmail.com');
