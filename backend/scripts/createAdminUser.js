// Script to create an admin user
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../utils/passwordUtils');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-donation-db');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fooddonation.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hashPassword('Admin@123');
    
    const adminUser = new User({
      email: 'admin@fooddonation.com',
      password: hashedPassword,
      role: 'ADMIN',
      first_name: 'System',
      last_name: 'Administrator',
      phone_number: '1234567890',
      address: {
        street: 'Admin Office',
        city: 'Hyderabad',
        state: 'Telangana',
        postal_code: '500001',
        country: 'India'
      },
      is_active: true,
      is_email_verified: true,
      points: 0
    });

    await adminUser.save();
    console.log('✓ Admin user created successfully!');
    console.log('  Email: admin@fooddonation.com');
    console.log('  Password: Admin@123');
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdminUser();
