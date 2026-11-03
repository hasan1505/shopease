import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopease';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Reuse the connection across API route invocations (warm lambdas on Vercel)
const globalWithMongo = globalThis as typeof globalThis & { __mongoose?: MongooseCache };
const cache: MongooseCache = globalWithMongo.__mongoose ?? { conn: null, promise: null };
globalWithMongo.__mongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
