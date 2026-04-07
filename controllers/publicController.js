const Blog = require('../models/Blog');
const { hasScheduledTimeArrived } = require('../utils/timezoneHelper');

// @desc    Get all published blogs for frontend
// @route   GET /api/public/blogs
// @access  Public
exports.getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    
    // Find all published and scheduled blogs
    const allBlogs = await Blog.find({
      $or: [
        { status: 'published' },
        { status: 'scheduled' }
      ]
    });
    
    // Apply filters for category, tag, and search
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
    
    // Filter blogs based on Indian timezone
    const visibleBlogs = filteredBlogs.filter(blog => {
      if (blog.status === 'published') {
        return true;
      }
      if (blog.status === 'scheduled') {
        return hasScheduledTimeArrived(blog.scheduledFor);
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

    const total = visibleBlogs.length;

    res.json({
      success: true,
      data: paginatedBlogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// @desc    Get published blog by slug for frontend
// @route   GET /api/public/blogs/:slug
// @access  Public
exports.getPublishedBlogBySlug = async (req, res) => {
  try {
    // Find the blog
    const blog = await Blog.findOne({
      slug: req.params.slug,
      $or: [
        { status: 'published' },
        { status: 'scheduled' }
      ]
    });
    
    // Check if blog should be visible based on Indian timezone
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    if (blog.status === 'scheduled' && !hasScheduledTimeArrived(blog.scheduledFor)) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
};

// @desc    Get blog categories for frontend
// @route   GET /api/public/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', {
      $or: [
        { status: 'published' },
        { 
          status: 'scheduled', 
          scheduledFor: { $lte: new Date() }
        }
      ]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Get all tags for frontend
// @route   GET /api/public/tags
// @access  Public
exports.getTags = async (req, res) => {
  try {
    const tags = await Blog.distinct('tags', {
      $or: [
        { status: 'published' },
        { 
          status: 'scheduled', 
          scheduledFor: { $lte: new Date() }
        }
      ]
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// @desc    Get related blogs
// @route   GET /api/public/blogs/:slug/related
// @access  Public
exports.getRelatedBlogs = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      $or: [
        { status: 'published' },
        { 
          status: 'scheduled', 
          scheduledFor: { $lte: new Date() }
        }
      ]
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Find related blogs based on category or tags
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ],
      $or: [
        { status: 'published' },
        { 
          status: 'scheduled', 
          scheduledFor: { $lte: new Date() }
        }
      ]
    })
    .select('slug title category coverImage excerpt publishedAt readTime')
    .limit(5)
    .sort({ publishedAt: -1 });

    res.json({
      success: true,
      data: relatedBlogs
    });
  } catch (error) {
    console.error('Error fetching related blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching related blogs',
      error: error.message
    });
  }
};
