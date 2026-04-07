const express = require('express');
const router = express.Router();
const {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getCategories,
  getTags,
  getRelatedBlogs
} = require('../controllers/publicController');

// Public blog routes (no authentication required)
router.get('/blogs', getPublishedBlogs);
router.get('/blogs/:slug', getPublishedBlogBySlug);
router.get('/blogs/:slug/related', getRelatedBlogs);
router.get('/categories', getCategories);
router.get('/tags', getTags);

module.exports = router;
