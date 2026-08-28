/**
 * Centralized Express error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  // Log error internally for debugging
  console.error(`[Error] ${err.stack || err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
};

module.exports = errorHandler;
