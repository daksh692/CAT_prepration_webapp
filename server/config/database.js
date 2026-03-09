const mongoose = require('mongoose');
require('dotenv').config();

// Get the URI from environment variables depending on production/development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catprep';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      // Removed serverApi: strict: true as it causes APIStrictError with Mongoose
    });
    console.log('✅ Secondary DB Check: MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Replicate the testConnection and onlinePool mock interfaces for minimal disruption initially
async function testConnection() {
  await connectDB();
}

module.exports = { connectDB, testConnection };
