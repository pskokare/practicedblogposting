const cron = require('node-cron');
const Blog = require('../models/Blog');
const { hasScheduledTimeArrived } = require('./timezoneHelper');

class BlogScheduler {
  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  startScheduler() {
    if (this.isRunning) {
      console.log('Blog scheduler is already running');
      return;
    }

    // Run every minute to check for scheduled blogs
    this.task = cron.schedule('* * * * *', async () => {
      await this.checkAndPublishScheduledBlogs();
    }, {
      scheduled: false
    });

    this.task.start();
    this.isRunning = true;
    console.log('Blog scheduler started - checking every minute for scheduled blogs');
  }

  stopScheduler() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log('Blog scheduler stopped');
    }
  }

  async checkAndPublishScheduledBlogs() {
    try {
      // Find all scheduled blogs
      const allScheduledBlogs = await Blog.find({
        status: 'scheduled'
      });
      
      // Filter blogs whose scheduled time has arrived in Indian timezone
      const scheduledBlogs = allScheduledBlogs.filter(blog => 
        hasScheduledTimeArrived(blog.scheduledFor)
      );
      
      if (scheduledBlogs.length > 0) {
        console.log(`Found ${scheduledBlogs.length} scheduled blogs to publish`);
        
        for (const blog of scheduledBlogs) {
          try {
            blog.status = 'published';
            blog.publishedAt = new Date();
            await blog.save();
            console.log(`Published blog: "${blog.title}" (Slug: ${blog.slug})`);
          } catch (error) {
            console.error(`Error publishing blog "${blog.title}":`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in blog scheduler:', error);
    }
  }

  // Manual method to check and publish (for testing)
  async manualCheck() {
    console.log('Manual check for scheduled blogs...');
    await this.checkAndPublishScheduledBlogs();
  }
}

// Create and export a singleton instance
const scheduler = new BlogScheduler();

module.exports = scheduler;
