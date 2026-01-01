const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Seed admin user
const seedAdmin = async () => {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'kamal@gmail.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Name:', existingAdmin.name);
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('123456', salt);

        // Create admin user
        const adminUser = new User({
            name: 'ProAdmin',
            email: 'kamal@gmail.com',
            passwordHash: passwordHash,
            phone: '0740536517',
            role: 'admin',
            location: 'meesalai',
            status: 'active'
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log('Email: kamal@gmail.com');
        console.log('Password: 123456');
        console.log('Name: ProAdmin');
        console.log('Role: admin');
        console.log('Phone: 0740536517');
        console.log('Location: meesalai');
        console.log('Status: active');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

// Run the seed function
seedAdmin();
