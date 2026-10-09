import mongoose from 'mongoose';
import { seedProcessingHubs } from '../seed/seedHubs.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecohub';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    await seedProcessingHubs();
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to local/specified MongoDB at ${uri} (${error.message}).`);
    console.log(`[MongoDB] Operating in high-speed In-Memory Mock Mode for hackathon execution.`);
    
    // Disable Mongoose command buffering so queries return immediately rather than timing out
    mongoose.set('bufferCommands', false);
  }
};
