import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { connectDB } from './lib/mongoose';

const PORT = process.env.PORT || '3000';
const URI = process.env.MONGO_URI as string;

async function start(): Promise<void> {
  await connectDB(URI);
  app.listen(Number(PORT), () => console.log(`API en http://localhost:${PORT}`));
}
start();