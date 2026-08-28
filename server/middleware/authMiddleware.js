const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT token and attach current user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      // Verify token
      const decoded = jwt.verify(token, secret);

      // Check database readiness
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: 'Database connection is currently unavailable. Please verify MongoDB Atlas credentials.',
        });
      }

      // Fetch current active user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Attach user to request object
      req.user = user;
      return next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
};

/**
 * Role authorization middleware factory
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'trainer', 'trainee')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};
