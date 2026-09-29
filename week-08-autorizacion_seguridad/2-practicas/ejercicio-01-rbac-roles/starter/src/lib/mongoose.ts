import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('La variable MONGO_URI no esta configurada');
  }

  await mongoose.connect(mongoUri);

  console.log('MongoDB conectado correctamente');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();

  console.log('MongoDB desconectado correctamente');
}