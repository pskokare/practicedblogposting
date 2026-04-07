const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-scheduling', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateScheduledDate = async () => {
  try {
    // Calculate tomorrow at 8 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    console.log('Updating blog scheduled date to:', tomorrow.toISOString());
    
    // Update the specific blog by slug
    const result = await Blog.updateOne(
      { slug: '10-things-no-one-tells-you-after-a-loved-one-has-a-stroke' },
      { 
        $set: { 
          scheduledFor: tomorrow,
          status: 'scheduled'
        }
      }
    );
    
    console.log('Update result:', result);
    
    if (result.modifiedCount > 0) {
      console.log('✅ Blog scheduled date updated successfully');
    } else {
      console.log('❌ Blog not found or already updated');
    }
    
    // Verify the update
    const updatedBlog = await Blog.findOne({ 
      slug: '10-things-no-one-tells-you-after-a-loved-one-has-a-stroke' 
    });
    
    if (updatedBlog) {
      console.log('Updated blog details:');
      console.log('- Title:', updatedBlog.title);
      console.log('- Status:', updatedBlog.status);
      console.log('- Scheduled For:', updatedBlog.scheduledFor);
    }
    
  } catch (error) {
    console.error('Error updating blog:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateScheduledDate();
