const { generateToken } = require('../middleware/auth');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple authentication - in production, use proper User model with bcrypt
    // For demo purposes, using hardcoded credentials
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken('admin', username);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: 'admin',
          username: username
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
