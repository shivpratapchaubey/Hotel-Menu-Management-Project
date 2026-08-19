const mongoose = require('mongoose');

let dbMode = 'mongodb'; // Default mode

const connectDB = async () => {
  if (process.env.USE_LOCAL_JSON_DB === 'true') {
    dbMode = 'jsondb';
    console.log('--------------------------------------------------');
    console.log('⚠️ DATABASE: Forced local JSON file DB mode active!');
    console.log('📁 Data stored in: backend/data/db.json');
    console.log('--------------------------------------------------');
    return 'jsondb';
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-menu', {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fail fast if MongoDB is not running
    });
    dbMode = 'mongodb';
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return 'mongodb';
  } catch (error) {
    dbMode = 'jsondb';
    console.log('--------------------------------------------------');
    console.log('⚠️ DATABASE WARNING: Could not connect to MongoDB!');
    console.log(`Reason: ${error.message}`);
    console.log('🔄 Fallback: Automatically switched to local JSON DB mode.');
    console.log('📁 Data stored in: backend/data/db.json');
    console.log('--------------------------------------------------');
    return 'jsondb';
  }
};

const getDbMode = () => dbMode;

module.exports = {
  connectDB,
  getDbMode
};
