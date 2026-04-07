const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { indianTimeToUTC, getIndianTime, formatIndianTime, hasScheduledTimeArrived } = require('../utils/timezoneHelper');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-scheduling', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testIndianScheduling = async () => {
  try {
    console.log('=== Indian Timezone Scheduling Test ===');
    
    // Show current times
    const nowUTC = new Date();
    const nowIndian = getIndianTime();
    
    console.log('Current UTC Time:', nowUTC.toISOString());
    console.log('Current Indian Time:', formatIndianTime(nowIndian));
    console.log('Current Indian Local:', nowIndian.toLocaleString());
    
    // Test 1: Schedule blog for 2 minutes from now (Indian time)
    const futureTime = new Date(nowIndian.getTime() + 2 * 60 * 1000);
    console.log('\n=== Test 1: Schedule for 2 minutes from now ===');
    console.log('Target Indian Time:', formatIndianTime(futureTime));
    
    const scheduledTimeUTC = indianTimeToUTC(futureTime.toISOString());
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
    
    console.log('Update result:', result.modifiedCount > 0 ? '✅ Success' : '❌ Failed');
    
    // Test 2: Check visibility
    console.log('\n=== Test 2: Check Visibility ===');
    const updatedBlog = await Blog.findOne({ 
      slug: '10-things-no-one-tells-you-after-a-loved-one-has-a-stroke' 
    });
    
    if (updatedBlog) {
      console.log('Blog Status:', updatedBlog.status);
      console.log('Scheduled For (UTC):', updatedBlog.scheduledFor.toISOString());
      console.log('Scheduled For (Indian):', formatIndianTime(utcToIndianTime(updatedBlog.scheduledFor)));
      
      const shouldBeVisible = hasScheduledTimeArrived(updatedBlog.scheduledFor);
      console.log('Should be visible now:', shouldBeVisible ? '✅ Yes' : '❌ No');
      
      if (!shouldBeVisible) {
        const timeUntilVisible = (utcToIndianTime(updatedBlog.scheduledFor) - nowIndian) / (1000 * 60);
        console.log('Minutes until visible:', Math.abs(timeUntilVisible).toFixed(2));
      }
    }
    
    // Test 3: Test scheduler manually
    console.log('\n=== Test 3: Manual Scheduler Test ===');
    const { checkAndPublishScheduledBlogs } = require('../utils/scheduler');
    await checkAndPublishScheduledBlogs();
    
    // Check if blog was published
    const blogAfterScheduler = await Blog.findOne({ 
      slug: '10-things-no-one-tells-you-after-a-loved-one-has-a-stroke' 
    });
    
    console.log('Blog status after scheduler check:', blogAfterScheduler.status);
    if (blogAfterScheduler.status === 'published') {
      console.log('✅ Scheduler successfully published the blog');
    } else {
      console.log('❌ Scheduler did not publish the blog (expected - time not reached)');
    }
    
  } catch (error) {
    console.error('Error testing Indian scheduling:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testIndianScheduling();
