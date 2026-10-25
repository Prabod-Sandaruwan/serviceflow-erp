import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/prisma';
import { requestIdMiddleware } from './middleware/requestId';
import { httpLogger } from './config/logger';
import { notFoundHandler, errorHandler } from './middleware/error';

const app: Application = express();

// Request tracking and structured logging
app.use(requestIdMiddleware);
app.use(httpLogger);

// Security and standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Handler
const healthCheckHandler = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'ServiceFlow ERP API',
    });
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: 'Database ping failed',
    });
  }
};

app.get('/health', healthCheckHandler);
app.get('/api/v1/health', healthCheckHandler);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Central Global Error Handler
app.use(errorHandler);

export { app };
export default app;
