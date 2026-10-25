import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';

export const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';

export const securityHeaders = helmet();

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === CLIENT_ORIGIN) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Idempotency-Key'],
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
