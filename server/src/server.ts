import app from './app';
import { env } from './config/env';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[ServiceFlow ERP] Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`[ServiceFlow ERP] Health check: http://localhost:${PORT}/api/v1/health`);
});

const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('Server process terminated gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
