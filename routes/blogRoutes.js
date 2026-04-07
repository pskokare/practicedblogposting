const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogBySlug
} = require('../controllers/blogController');
const upload = require('../middleware/upload');

// Blog routes
router.post('/', 
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]), 
  createBlog
);
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);

module.exports = router;
