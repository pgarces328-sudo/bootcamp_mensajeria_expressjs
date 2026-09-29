import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './lib/mongoose';

const PORT = process.env.PORT || 3000;

(async () => {
    await connectDB();
    console.log('MongoDB Conectado');
    app.listen(PORT, () => {
        console.log('Servidor corriendo en puerto ' + PORT);
    });
})();
