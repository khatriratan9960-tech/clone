import mongoose from 'mongoose';
import { config } from './config.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUrl, {
    dbName: config.dbName,
    serverSelectionTimeoutMS: 8000,
  });
  const { name, host } = mongoose.connection;
  console.log(`[db] connected to ${host}/${name}`);
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
