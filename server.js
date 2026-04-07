const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Database debug endpoint
app.get('/api/debug/db', async (req, res) => {
  if (!process.env.MONGODB_URI) {
    return res.json({
      success: false,
      message: 'MONGODB_URI not set'
    });
  }
  
  try {
    const Blog = require('./models/Blog');
    const allBlogs = await Blog.find({});
    const publishedBlogs = await Blog.find({ status: 'published' });
    const scheduledBlogs = await Blog.find({ status: 'scheduled' });
    const draftBlogs = await Blog.find({ status: 'draft' });
    
    res.json({
      success: true,
      message: 'Database connected successfully',
      stats: {
        total: allBlogs.length,
        published: publishedBlogs.length,
        scheduled: scheduledBlogs.length,
        draft: draftBlogs.length
      },
      blogs: allBlogs.map(blog => ({
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        createdAt: blog.createdAt,
        publishedAt: blog.publishedAt,
        scheduledFor: blog.scheduledFor
      }))
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Database connection and routes
if (process.env.MONGODB_URI) {
  try {
    console.log('Connecting to database...');
    const connectDB = require('./config/db');
    connectDB();
    
    console.log('Database connected successfully');
    
    // Use actual database routes
    app.use('/api/public', require('./routes/publicRoutes'));
    app.use('/api/blogs', require('./routes/blogRoutes'));
    app.use('/api/authors', require('./routes/authorRoutes'));
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Fallback to mock data if database fails
    app.get('/api/public/blogs', (req, res) => {
      res.json({
        success: true,
        data: [
          {
            _id: '1',
            title: 'Test Blog 1 (Database Error)',
            slug: 'test-blog-1',
            author: 'Test Author',
            content: '<p>Database connection failed. This is mock data.</p>',
            coverImage: 'https://via.placeholder.com/400x250?text=Database+Error',
            createdAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            views: 0,
            readTime: 2
          }
        ],
        message: 'Database connection failed - showing mock data'
      });
    });
    
    app.get('/api/public/blogs/:slug', (req, res) => {
      res.json({
        success: true,
        data: {
          _id: '1',
          title: 'Test Blog 1 (Database Error)',
          slug: req.params.slug,
          author: 'Test Author',
          content: '<h1>Database Error</h1><p>Database connection failed. This is mock data.</p>',
          coverImage: 'https://via.placeholder.com/800x400?text=Database+Error',
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          views: 0,
          readTime: 2
        }
      });
    });
    
    // Fallback endpoints
    app.get('/api/blogs', (req, res) => {
      res.redirect('/api/public/blogs');
    });
    
    app.get('/api/blogs/:slug', (req, res) => {
      res.redirect(`/api/public/blogs/${req.params.slug}`);
    });
  }
} else {
  console.log('MONGODB_URI not set - using mock data');
  
  // Mock data if no environment variables
  app.get('/api/public/blogs', (req, res) => {
    res.json({
      success: true,
      data: [
        {
          _id: '1',
          title: 'Test Blog 1 (No Database)',
          slug: 'test-blog-1',
          author: 'Test Author',
          content: '<p>No database configured. This is mock data.</p>',
          coverImage: 'https://via.placeholder.com/400x250?text=No+Database',
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          views: 0,
          readTime: 2
        }
      ],
      message: 'Database not configured - showing mock data'
    });
  });
  
  app.get('/api/public/blogs/:slug', (req, res) => {
    res.json({
      success: true,
      data: {
        _id: '1',
        title: 'Test Blog 1 (No Database)',
        slug: req.params.slug,
        author: 'Test Author',
        content: '<h1>No Database</h1><p>Database not configured. This is mock data.</p>',
        coverImage: 'https://via.placeholder.com/800x400?text=No+Database',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        views: 0,
        readTime: 2
      }
    });
  });
  
  // Fallback endpoints
  app.get('/api/blogs', (req, res) => {
    res.redirect('/api/public/blogs');
  });
  
  app.get('/api/blogs/:slug', (req, res) => {
    res.redirect(`/api/public/blogs/${req.params.slug}`);
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
