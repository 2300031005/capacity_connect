const { getDbStatus } = require('../config/db');

/**
 * @desc    Get API and Database health status
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = (req, res) => {
  const dbStatus = getDbStatus();

  res.status(200).json({
    success: true,
    message: 'Capacity Connect API is running',
    database: dbStatus,
  });
};

module.exports = {
  getHealth,
};
