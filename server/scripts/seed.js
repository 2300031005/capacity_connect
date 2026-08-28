const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const demoUsers = [
  {
    name: 'Platform Administrator',
    email: 'admin@capacityconnect.local',
    password: 'Admin@123',
    role: 'admin',
    department: 'System Administration',
    skills: ['Platform Governance', 'User Management', 'Curriculum Audit'],
    isActive: true,
  },
  {
    name: 'Lead Trainer',
    email: 'trainer@capacityconnect.local',
    password: 'Trainer@123',
    role: 'trainer',
    department: 'Engineering & Technical Training',
    skills: ['Instructional Design', 'Full-Stack Development', 'Assessment Creation'],
    isActive: true,
  },
  {
    name: 'Alex Trainee',
    email: 'trainee@capacityconnect.local',
    password: 'Trainee@123',
    role: 'trainee',
    department: 'Software Development',
    skills: ['JavaScript', 'React', 'Node.js'],
    isActive: true,
  },
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('Seeding failed: MONGO_URI is not configured in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('Database connected successfully.');

    for (const demoUser of demoUsers) {
      const existingUser = await User.findOne({ email: demoUser.email });

      if (existingUser) {
        // Update user properties and re-save if password needs to match
        existingUser.name = demoUser.name;
        existingUser.role = demoUser.role;
        existingUser.department = demoUser.department;
        existingUser.skills = demoUser.skills;
        existingUser.isActive = demoUser.isActive;
        existingUser.password = demoUser.password; // will be hashed by pre-save hook
        await existingUser.save();
        console.log(`Updated demo account: ${demoUser.email} (${demoUser.role})`);
      } else {
        await User.create(demoUser);
        console.log(`Created demo account: ${demoUser.email} (${demoUser.role})`);
      }
    }

    console.log('\nSeed completed successfully! Demo accounts are ready:');
    console.log('----------------------------------------------------');
    console.log('Admin:   admin@capacityconnect.local   / Admin@123');
    console.log('Trainer: trainer@capacityconnect.local / Trainer@123');
    console.log('Trainee: trainee@capacityconnect.local / Trainee@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
