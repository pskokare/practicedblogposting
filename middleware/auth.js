const jwt = require('jsonwebtoken');
const Blog = require('../models/Blog');

// Simple authentication middleware for admin routes
// In production, you should use a proper User model with bcrypt
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // For simplicity, we're not using a User model in this basic version
      // In production, you would fetch user from database
      req.user = { id: decoded.id, username: decoded.username };
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Generate JWT Token
const generateToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = { protect, generateToken };
