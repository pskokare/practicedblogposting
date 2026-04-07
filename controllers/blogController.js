const Blog = require('../models/Blog');
const ContentHelper = require('../utils/contentHelper');
const { processHeadingHierarchySimple } = require('../utils/headingHelper');
const { indianTimeToUTC } = require('../utils/timezoneHelper');
const slugify = require('slugify');

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private (Admin)
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      category,
      tags,
      metaTitle,
      metaDescription,
      content,
      status,
      scheduledFor,
      excerpt,
      author,
      createdBy,
      updatedBy
    } = req.body;

    // Validate author (simple text validation)
    if (!author || author.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide an author name'
      });
    }

    // Generate slug from title
    let slug = slugify(title, { lower: true, strict: true });
    
    // Check if slug already exists and make it unique
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle multiple content images
    const contentImages = [];
    if (req.files && req.files.contentImages) {
      const contentImageFiles = Array.isArray(req.files.contentImages) 
        ? req.files.contentImages 
        : [req.files.contentImages];
      
      for (const file of contentImageFiles) {
        contentImages.push(file.path);
      }
    }

    // Validate content images
    const imageValidation = ContentHelper.validateContentImages(content, contentImages);
    if (!imageValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: imageValidation.message,
        validation: imageValidation
      });
    }

    // Process content to ensure proper heading hierarchy
    const processedContent = processHeadingHierarchySimple(content);

    // Prepare blog data
    const blogData = {
      slug,
      title,
      category,
      tags: Array.isArray(tags) ? tags : [tags],
      metaTitle,
      metaDescription,
      coverImage: req.files && req.files.coverImage ? req.files.coverImage[0].path : '',
      contentImages,
      content: processedContent,
      status: status || 'draft',
      scheduledFor: status === 'scheduled' ? indianTimeToUTC(scheduledFor) : null,
      excerpt,
      author: author.trim(), // Use the author name directly
      createdBy: createdBy || 'admin',
      updatedBy: updatedBy || 'admin'
    };

    // Set publishedAt for immediate publishing
    if (status === 'published') {
      blogData.publishedAt = new Date();
    }

    const blog = new Blog(blogData);
    await blog.save();

    // No need to populate author since it's now a simple text field

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
};

// @desc    Get all blogs (for admin)
// @route   GET /api/blogs
// @access  Private (Admin)
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    // Process content images for each blog
    const processedBlogs = blogs.map(blog => {
      const blogData = blog.toObject();
      blogData.content = ContentHelper.processContentImages(blog.content, blog.contentImages);
      return blogData;
    });

    res.json({
      success: true,
      data: processedBlogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    // Process content images (replace placeholders with actual image URLs)
    const processedContent = ContentHelper.processContentImages(blog.content, blog.contentImages);
    
    // Create a copy of blog data with processed content
    const blogData = blog.toObject();
    blogData.content = processedContent;

    res.json({
      success: true,
      data: blogData
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
