const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
  // For Sequelize user may have .id; for Mongoose user has ._id
  const id = user._id || user.id || user.uuid || null;

  return jwt.sign(
    {
      id,
      uuid: user.uuid,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
