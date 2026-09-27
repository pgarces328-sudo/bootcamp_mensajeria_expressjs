import app from './app';
import { connectDB } from './lib/mongoose';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
(async () => { 
    await connectDB(); 
    console.log('DB OK'); 
    app.listen(PORT, () => {
        const msg = "Servidor listo en puerto " + PORT;
        console.log(msg);
    });
})();
