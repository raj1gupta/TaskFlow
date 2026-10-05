const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
