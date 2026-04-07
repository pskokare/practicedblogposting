const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Author = require('../models/Author');

// Load environment variables
dotenv.config();

async function checkAuthors() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all authors
    const authors = await Author.find({ isActive: true });
    
    console.log('\n=== AVAILABLE AUTHORS ===');
    console.log('Use these EXACT names when creating blogs:\n');
    
    authors.forEach((author, index) => {
      console.log(`${index + 1}. Name: "${author.name}"`);
      console.log(`   Email: ${author.email}`);
      console.log(`   ID: ${author._id}`);
      console.log('');
    });

    if (authors.length === 0) {
      console.log('No authors found! Creating sample authors...');
      
      // Create sample authors if none exist
      const sampleAuthors = [
        {
          name: 'Sarah Johnson',
          email: 'sarah@techblog.com',
          bio: 'Full-stack developer with 8 years of experience',
          isActive: true
        },
        {
          name: 'Michael Chen',
          email: 'michael@techblog.com',
          bio: 'Machine learning engineer and data scientist',
          isActive: true
        },
        {
          name: 'Emily Rodriguez',
          email: 'emily@techblog.com',
          bio: 'UX/UI designer and frontend developer',
          isActive: true
        }
      ];

      for (const authorData of sampleAuthors) {
        const author = new Author(authorData);
        await author.save();
        console.log(`Created author: ${author.name}`);
      }

      console.log('\nNow try again with these author names:');
      console.log('- "Sarah Johnson"');
      console.log('- "Michael Chen"');
      console.log('- "Emily Rodriguez"');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAuthors();
