import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jaipur-gadget');
    console.log('MongoDB Connected');

    const adminEmail = 'tusharadmin@gmail.com'; // Use lowercase for consistency
    const adminPassword = 'Tushar@54321';
    const adminName = 'Tushar Admin';

    // Check if admin already exists (email will be stored in lowercase due to schema)
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (existingAdmin) {
      // Update existing user to admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
      }
      // Update password - set directly, pre-save hook will hash it
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin user - password will be hashed by pre-save hook
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Pre-save hook will hash this
        role: 'admin',
        phone: ''
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Role: admin');
    }

    // Verify admin was created/updated
    const admin = await User.findOne({ email: adminEmail.toLowerCase() });
    console.log('\n📋 Admin Details:');
    console.log('   ID:', admin._id);
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Created:', admin.createdAt);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
