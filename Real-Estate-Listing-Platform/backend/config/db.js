const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gharfind';
  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message} (Disabling command buffering for instant response)`);
    mongoose.set('bufferCommands', false);
    return null;
  }
};

module.exports = connectDB;
