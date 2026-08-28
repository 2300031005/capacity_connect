const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} userId - Mongo user ID
 * @param {string} role - User role (trainee, trainer, admin)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in server environment variables.');
  }

  const expiresIn = process.env.JWT_EXPIRE || '1d';

  return jwt.sign(
    {
      userId: userId.toString(),
      role,
    },
    secret,
    {
      expiresIn,
    }
  );
};

module.exports = {
  generateToken,
};
