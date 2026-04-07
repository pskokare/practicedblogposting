const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  // Basic Information
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // SEO Fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  canonicalUrl: {
    type: String,
    trim: true
  },
  
  // Cover Image
  coverImage: {
    type: String,
    required: true
  },
  
  // Content Images (multiple images within content)
  contentImages: [{
    type: String
  }],
  
  // Content
  content: {
    type: String,
    required: true
  },
  
  // Publishing and Scheduling
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Additional Fields
  excerpt: {
    type: String,
    trim: true
  },
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Author Name (simple text field)
  author: {
    type: String,
    required: true,
    trim: true
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  
  // Analytics (optional)
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if blog is currently published
blogSchema.virtual('isPublished').get(function() {
  if (this.status === 'published') {
    return true;
  }
  if (this.status === 'scheduled' && this.scheduledFor && new Date() >= this.scheduledFor) {
    return true;
  }
  return false;
});

// Virtual for URL
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Pre-save middleware to generate canonical URL and calculate read time
blogSchema.pre('save', function(next) {
  // Generate canonical URL if not provided
  if (!this.canonicalUrl) {
    this.canonicalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/blog/${this.slug}`;
  }
  
  // Calculate read time (average reading speed: 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  // Generate excerpt if not provided (first 150 characters)
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  }
  
  // Update timestamps
  this.updatedAt = new Date();
  
  next();
});

// Indexes for better performance
blogSchema.index({ status: 1 });
blogSchema.index({ scheduledFor: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({
    $or: [
      { status: 'published' },
      { 
        status: 'scheduled', 
        scheduledFor: { $lte: new Date() }
      }
    ]
  }).sort({ publishedAt: -1, createdAt: -1 });
};

// Static method to find scheduled blogs that need to be published
blogSchema.statics.findScheduledToPublish = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() }
  });
};

// Instance method to publish blog
blogSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);
