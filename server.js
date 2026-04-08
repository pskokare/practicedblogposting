const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Original blog routes (what frontend expects)
app.get('/api/blogs', async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    ssl: true,
    sslValidate: false
  });
  
  const Blog = require('./models/Blog');
  const blogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1 });
  
  await mongoose.disconnect();
  
  res.json({
    success: true,
    data: blogs
  });
});

// Add trailing slash version to match Postman
app.get('/api/blogs/', async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    ssl: true,
    sslValidate: false
  });
  
  const Blog = require('./models/Blog');
  const blogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1 });
  
  await mongoose.disconnect();
  
  res.json({
    success: true,
    data: blogs
  });
});

// Get single blog by slug
app.get('/api/blogs/:slug', async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    ssl: true,
    sslValidate: false
  });
  
  const Blog = require('./models/Blog');
  const blog = await Blog.findOne({ slug: req.params.slug });
  
  await mongoose.disconnect();
  
  res.json({
    success: true,
    data: blog
  });
});

// Add trailing slash version for single blog
app.get('/api/blogs/:slug/', async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    ssl: true,
    sslValidate: false
  });
  
  const Blog = require('./models/Blog');
  const blog = await Blog.findOne({ slug: req.params.slug });
  
  await mongoose.disconnect();
  
  res.json({
    success: true,
    data: blog
  });
});

// Public routes (for compatibility)
app.get('/api/public/blogs', async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    ssl: true,
    sslValidate: false
  });
  
  const Blog = require('./models/Blog');
  const blogs = await Blog.find({ status: 'published' }).sort({ publishedAt: -1 });
  
  await mongoose.disconnect();
  
  res.json({
    success: true,
    data: blogs
  });
});

app.get('/api/public/blogs/:slug', async (req, res) => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    ssl: true,
    sslValidate: false
  });
  
  const Blog = require('./models/Blog');
  const blog = await Blog.findOne({ slug: req.params.slug });
  
  await mongoose.disconnect();
  
  res.json({
    success: true,
    data: blog
  });
});

module.exports = app;
