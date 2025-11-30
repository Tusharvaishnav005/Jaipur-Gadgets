import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const admin = await User.findOne({ email: 'tusharadmin@gmail.com' });
    
    if (admin) {
      console.log('✅ Admin user found!');
      console.log('   Email:', admin.email);
      console.log('   Role:', admin.role);
      console.log('   Name:', admin.name);
      console.log('   ID:', admin._id);
    } else {
      console.log('❌ Admin user NOT found!');
      console.log('   Run: npm run create-admin');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();

