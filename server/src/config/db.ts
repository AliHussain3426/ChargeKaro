import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(connectionString: string = env.MONGODB_URI): Promise<void> {
  try {
    const conn = await mongoose.connect(connectionString);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
