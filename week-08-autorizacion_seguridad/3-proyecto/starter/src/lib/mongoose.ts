import mongoose from 'mongoose';
export const connectDB = async () => {
    try { await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mensajeria_db'); console.log('Mongo Connected'); }
    catch(e) { console.error(e); process.exit(1); }
};
