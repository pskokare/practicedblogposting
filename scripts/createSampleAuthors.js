const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Author = require('../models/Author');

// Load environment variables
dotenv.config();

// Sample authors data
const sampleAuthors = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@techblog.com',
    bio: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud architecture. Passionate about sharing knowledge and helping developers grow.',
    avatar: '',
    social: {
      twitter: '@sarahjohnson',
      linkedin: 'sarah-johnson-dev',
      github: 'sarahjdev',
      website: 'https://sarahjohnson.dev'
    }
  },
  {
    name: 'Michael Chen',
    email: 'michael@techblog.com',
    bio: 'Machine learning engineer and data scientist. Specializing in AI, Python, and deep learning. Love writing about cutting-edge technology trends.',
    avatar: '',
    social: {
      twitter: '@michaelchen',
      linkedin: 'michael-chen-ml',
      github: 'mchenai',
      website: 'https://michaelchen.ai'
    }
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@techblog.com',
    bio: 'UX/UI designer and frontend developer. Creating beautiful, user-friendly interfaces with modern design principles and accessibility in mind.',
    avatar: '',
    social: {
      twitter: '@emilydesigns',
      linkedin: 'emily-rodriguez-ux',
      github: 'emilyux',
      website: 'https://emilyrodriguez.design'
    }
  }
];

async function createSampleAuthors() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing authors (optional - comment out if you want to keep existing)
    await Author.deleteMany({});
    console.log('Cleared existing authors');

    // Create sample authors
    for (const authorData of sampleAuthors) {
      const author = new Author(authorData);
      await author.save();
      console.log(`Created author: ${author.name} (${author.email})`);
    }

    console.log('\nSample authors created successfully!');
    console.log('You can now use these authors when creating blogs.');

    // Display created authors
    const authors = await Author.find().select('name email _id');
    console.log('\nAvailable Authors:');
    authors.forEach(author => {
      console.log(`- ${author.name} (ID: ${author._id})`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating sample authors:', error);
    process.exit(1);
  }
}

createSampleAuthors();
