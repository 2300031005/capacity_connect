const mongoose = require('mongoose');

/**
 * Returns current MongoDB connection status string
 * @returns {'connected' | 'connecting' | 'disconnecting' | 'disconnected'}
 */
const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'disconnected';
};

/**
 * Connect to MongoDB Atlas database
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MongoDB Atlas connection error: MONGO_URI is not configured in environment variables.');
    return;
  }

  try {
    // Setup event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB Atlas connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  getDbStatus,
};
