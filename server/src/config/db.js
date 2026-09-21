import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  await mongoose.connect(env.MONGO_URI);
  const conn = mongoose.connection;
  const host = conn.host || 'unknown';
  const dbName = conn.name || 'unknown';
  const state = conn.readyState === 1 ? 'connected' : conn.readyState;

  let cropsCount = 0;
  let centresCount = 0;
  try {
    cropsCount = await conn.db.collection('crops').countDocuments();
    centresCount = await conn.db.collection('procurementcentres').countDocuments();
  } catch (err) {
    console.error('Error counting diagnostic collections:', err.message);
  }

  console.log('MongoDB connected');
  console.log(`MongoDB host: ${host}`);
  console.log(`MongoDB database: ${dbName}`);
  console.log(`MongoDB state: ${state}`);
  console.log(`MongoDB crops count: ${cropsCount}`);
  console.log(`MongoDB procurementcentres count: ${centresCount}`);
}

