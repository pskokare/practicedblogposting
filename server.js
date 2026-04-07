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
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      ssl: true,
      sslValidate: false
    });
    
    const Blog = require('./models/Blog');
    const allBlogs = await Blog.find({});
    const publishedBlogs = await Blog.find({ status: 'published' });
    const scheduledBlogs = await Blog.find({ status: 'scheduled' });
    const draftBlogs = await Blog.find({ status: 'draft' });
    
    await mongoose.disconnect();
    
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

// Public blogs endpoint with database connection
app.get('/api/public/blogs', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: true,
        data: [],
        message: 'Database not configured'
      });
    }

    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      ssl: true,
      sslValidate: false
    });
    
    const Blog = require('./models/Blog');
    const { page = 1, limit = 10, category, tag, search } = req.query;
    
    // Find all published and scheduled blogs
    const allBlogs = await Blog.find({
      $or: [
        { status: 'published' },
        { status: 'scheduled' }
      ]
    });
    
    // Apply filters
    let filteredBlogs = allBlogs;
    
    if (category) {
      filteredBlogs = filteredBlogs.filter(blog => blog.category === category);
    }
    
    if (tag) {
      filteredBlogs = filteredBlogs.filter(blog => blog.tags.includes(tag));
    }
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredBlogs = filteredBlogs.filter(blog => 
        searchRegex.test(blog.title) || 
        searchRegex.test(blog.content) || 
        blog.tags.some(tag => searchRegex.test(tag))
      );
    }
    
    // Filter blogs based on status
    const visibleBlogs = filteredBlogs.filter(blog => {
      if (blog.status === 'published') {
        return true;
      }
      if (blog.status === 'scheduled') {
        return new Date(blog.scheduledFor) <= new Date();
      }
      return false;
    });

    // Sort and paginate
    const sortedBlogs = visibleBlogs.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    const startIndex = (page - 1) * limit;
    const paginatedBlogs = sortedBlogs.slice(startIndex, startIndex + limit);

    await mongoose.disconnect();
    
    res.json({
      success: true,
      data: paginatedBlogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: visibleBlogs.length,
        pages: Math.ceil(visibleBlogs.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.json({
      success: true,
      data: [],
      message: `Database error: ${error.message}`
    });
  }
});

// Single blog endpoint
app.get('/api/public/blogs/:slug', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.json({
        success: false,
        message: 'Database not configured'
      });
    }

    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      ssl: true,
      sslValidate: false
    });
    
    const Blog = require('./models/Blog');
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug });
    
    await mongoose.disconnect();
    
    if (!blog) {
      return res.json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.json({
      success: false,
      message: `Database error: ${error.message}`
    });
  }
});

// Fallback endpoints
app.get('/api/blogs', (req, res) => {
  res.redirect('/api/public/blogs');
});

app.get('/api/blogs/:slug', (req, res) => {
  res.redirect(`/api/public/blogs/${req.params.slug}`);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
