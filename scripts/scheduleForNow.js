const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { indianTimeToUTC, getIndianTime, formatIndianTime } = require('../utils/timezoneHelper');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-scheduling', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const scheduleForNow = async () => {
  try {
    console.log('=== Schedule Blog for Current Time ===');
    
    // Get current Indian time
    const currentIndianTime = getIndianTime();
    console.log('Current Indian Time:', formatIndianTime(currentIndianTime));
    
    // Schedule for 1 minute ago to ensure it's visible
    const oneMinuteAgo = new Date(currentIndianTime.getTime() - 1 * 60 * 1000);
    console.log('Scheduling for:', formatIndianTime(oneMinuteAgo));
    
    const scheduledTimeUTC = indianTimeToUTC(oneMinuteAgo.toISOString());
    console.log('UTC Time for storage:', scheduledTimeUTC.toISOString());
    
    // Update the blog
    const result = await Blog.updateOne(
      { slug: '10-things-no-one-tells-you-after-a-loved-one-has-a-stroke' },
      { 
        $set: { 
          scheduledFor: scheduledTimeUTC,
          status: 'scheduled'
        }
      }
    );
    
    console.log('\n=== Update Result ===');
    console.log('Modified:', result.modifiedCount > 0 ? '✅ Yes' : '❌ No');
    
    // Verify the update
    const updatedBlog = await Blog.findOne({ 
      slug: '10-things-no-one-tells-you-after-a-loved-one-has-a-stroke' 
    });
    
    if (updatedBlog) {
      console.log('\n=== Blog Status ===');
      console.log('Title:', updatedBlog.title);
      console.log('Status:', updatedBlog.status);
      console.log('Scheduled For (UTC):', updatedBlog.scheduledFor.toISOString());
      console.log('Scheduled For (Indian):', formatIndianTime(new Date(updatedBlog.scheduledFor.getTime() + (5.5 * 60 * 60 * 1000))));
      
      // Test if it should be visible
      const { hasScheduledTimeArrived } = require('../utils/timezoneHelper');
      const shouldBeVisible = hasScheduledTimeArrived(updatedBlog.scheduledFor);
      console.log('Should be visible:', shouldBeVisible ? '✅ Yes' : '❌ No');
    }
    
  } catch (error) {
    console.error('Error scheduling blog:', error);
  } finally {
    await mongoose.disconnect();
  }
};

scheduleForNow();
