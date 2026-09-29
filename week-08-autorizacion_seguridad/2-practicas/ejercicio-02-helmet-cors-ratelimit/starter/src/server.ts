import 'dotenv/config';

import app from './app';
import {
  connectDB,
  disconnectDB,
} from './lib/mongoose';

const PORT = Number(process.env.PORT || 3000);

async function startServer(): Promise<void> {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      'Servidor de seguridad corriendo en http://localhost:' + PORT
    );
  });

  async function shutdown(signal: string): Promise<void> {
    console.log('Cerrando servidor por ' + signal);

    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

startServer().catch((error: unknown) => {
  console.error('No fue posible iniciar el servidor:', error);
  process.exit(1);
});