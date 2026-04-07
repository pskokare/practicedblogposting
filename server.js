const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS middleware - must be first
app.use(cors({
  origin: ['https://pragati-c2a04.web.app', 'https://practicedblogposting.vercel.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint (no database required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to check environment variables
app.get('/api/debug', (req, res) => {
  res.json({
    mongodb_uri_set: !!process.env.MONGODB_URI,
    node_env: process.env.NODE_ENV,
    cloudinary_set: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    all_vars: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

// Database connection and routes (only if environment variables are set)
if (process.env.MONGODB_URI) {
  try {
    const connectDB = require('./config/db');
    connectDB();
    
    // Routes that require database
    app.use('/api/public', require('./routes/publicRoutes'));
    app.use('/api/blogs', require('./routes/blogRoutes'));
    app.use('/api/authors', require('./routes/authorRoutes'));
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
} else {
  console.log('MONGODB_URI not set - database routes disabled');
  
  // Mock routes for testing without database
  app.get('/api/public/blogs', (req, res) => {
    res.json({
      success: true,
      data: [],
      message: 'Database not configured - no blogs available'
    });
  });
  
  app.get('/api/public/blogs/:slug', (req, res) => {
    res.json({
      success: false,
      message: 'Database not configured - blog not found'
    });
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
