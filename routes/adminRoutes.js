const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;
