import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export async function startTestDatabase(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}

export async function stopTestDatabase(): Promise<void> {
  await mongoose.disconnect();
  await mongoServer.stop();
}
