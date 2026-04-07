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

// Get all published blogs
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

// Get single blog by slug
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

// Fallback endpoints
app.get('/api/blogs', (req, res) => {
  res.redirect('/api/public/blogs');
});

app.get('/api/blogs/:slug', (req, res) => {
  res.redirect(`/api/public/blogs/${req.params.slug}`);
});

module.exports = app;
