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
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel-menu', {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fail fast if MongoDB is not running
    });
    dbMode = 'mongodb';
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return 'mongodb';
  } catch (error) {
    const localUri = 'mongodb://127.0.0.1:27017/hotel-menu';
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== localUri) {
      try {
        console.log(`⚠️ Primary MongoDB connection failed (${error.message}). Trying local MongoDB...`);
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 2000
        });
        dbMode = 'mongodb';
        console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
        return 'mongodb';
      } catch (localErr) {
        // Fall through to JSON DB mode
      }
    }

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
