import mongoose from 'mongoose';
import { env } from './env.js';

// Cache the connection across serverless function invocations (Vercel/serverless compatible)
let cached = (global as any).__mongooseCache as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = (global as any).__mongooseCache = { conn: null, promise: null };
}

export async function connectDB(connectionString: string = env.MONGODB_URI): Promise<void> {
  // If already connected, reuse the connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return;
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose.connect(connectionString).then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
