const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  social: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
authorSchema.index({ email: 1 });
authorSchema.index({ name: 1 });

module.exports = mongoose.model('Author', authorSchema);
