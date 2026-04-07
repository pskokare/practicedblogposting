const Author = require('../models/Author');

// @desc    Create a new author
// @route   POST /api/authors
// @access  Private (Admin)
exports.createAuthor = async (req, res) => {
  try {
    const { name, email, bio, avatar, social } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email'
      });
    }

    // Check if author already exists
    const existingAuthor = await Author.findOne({ email });
    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: 'Author with this email already exists'
      });
    }

    const author = new Author({
      name,
      email,
      bio,
      avatar: avatar || '',
      social: social || {}
    });

    await author.save();

    res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: author
    });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating author',
      error: error.message
    });
  }
};

// @desc    Get all authors
// @route   GET /api/authors
// @access  Public
exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find({ isActive: true })
      .select('name email bio avatar social')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: authors
    });
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching authors',
      error: error.message
    });
  }
};

// @desc    Get author by ID
// @route   GET /api/authors/:id
// @access  Public
exports.getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    res.json({
      success: true,
      data: author
    });
  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching author',
      error: error.message
    });
  }
};

// @desc    Update author
// @route   PUT /api/authors/:id
// @access  Private (Admin)
exports.updateAuthor = async (req, res) => {
  try {
    const { name, bio, avatar, social, isActive } = req.body;

    const author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Update fields
    if (name) author.name = name;
    if (bio) author.bio = bio;
    if (avatar) author.avatar = avatar;
    if (social) author.social = { ...author.social, ...social };
    if (isActive !== undefined) author.isActive = isActive;

    await author.save();

    res.json({
      success: true,
      message: 'Author updated successfully',
      data: author
    });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating author',
      error: error.message
    });
  }
};

// @desc    Delete author (deactivate)
// @route   DELETE /api/authors/:id
// @access  Private (Admin)
exports.deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Deactivate instead of delete
    author.isActive = false;
    await author.save();

    res.json({
      success: true,
      message: 'Author deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating author:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating author',
      error: error.message
    });
  }
};
