const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
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

// Register API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

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

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health Check available at: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
