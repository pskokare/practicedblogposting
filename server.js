const express = require('express');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working',
    env_vars: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET'
    }
  });
});

// Mock blogs endpoint
app.get('/api/public/blogs', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Test Blog 1',
        slug: 'test-blog-1',
        author: 'Test Author',
        content: '<p>This is a test blog content.</p>',
        coverImage: 'https://via.placeholder.com/400x250?text=Test+Blog+1',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        views: 0,
        readTime: 2
      }
    ],
    message: 'Mock blogs loaded successfully'
  });
});

// Fallback endpoint for any cached references to /api/blogs
app.get('/api/blogs', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Test Blog 1',
        slug: 'test-blog-1',
        author: 'Test Author',
        content: '<p>This is a test blog content.</p>',
        coverImage: 'https://via.placeholder.com/400x250?text=Test+Blog+1',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        views: 0,
        readTime: 2
      }
    ],
    message: 'Mock blogs loaded successfully (fallback endpoint)'
  });
});

// Mock single blog endpoint
app.get('/api/public/blogs/:slug', (req, res) => {
  const { slug } = req.params;
  res.json({
    success: true,
    data: {
      _id: '1',
      title: 'Test Blog 1',
      slug: slug,
      author: 'Test Author',
      content: '<h1>Test Blog Content</h1><p>This is the full content of the test blog.</p>',
      coverImage: 'https://via.placeholder.com/800x400?text=Test+Blog+1',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      views: 0,
      readTime: 2
    }
  });
});

// Fallback single blog endpoint
app.get('/api/blogs/:slug', (req, res) => {
  const { slug } = req.params;
  res.json({
    success: true,
    data: {
      _id: '1',
      title: 'Test Blog 1',
      slug: slug,
      author: 'Test Author',
      content: '<h1>Test Blog Content</h1><p>This is the full content of the test blog.</p>',
      coverImage: 'https://via.placeholder.com/800x400?text=Test+Blog+1',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      views: 0,
      readTime: 2
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
