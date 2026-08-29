const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const trainerLearnerRoutes = require('./routes/trainerLearnerRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const skillRoutes = require('./routes/skillRoutes');
const competencyRoutes = require('./routes/competencyRoutes');
const traineeSkillRoutes = require('./routes/traineeSkillRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { seedSkills } = require('./utils/skillSeeder');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS Configuration - read exclusively from ALLOWED_ORIGINS environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: Origin ${origin} not allowed.`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', userRoutes);
app.use('/api', trainerLearnerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/competencies', competencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', traineeSkillRoutes);
app.use('/api/ai', recommendationRoutes);
app.use('/api', moduleRoutes);
app.use('/api', resourceRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', reviewRoutes);
app.use('/api', discussionRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', certificateRoutes);

// 404 Handler for unknown routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Port Configuration
const PORT = process.env.PORT;

// Connect to Database and start server
const startServer = async () => {
  // Attempt DB Connection
  await connectDB();

  // Run idempotent skill seeder
  await seedSkills();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health Check available at: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
