import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import prisma from './config/prisma';
import { requestIdMiddleware } from './middleware/requestId';
import { httpLogger } from './config/logger';
import { securityHeaders, corsMiddleware } from './middleware/security';
import { sessionMiddleware } from './middleware/session';
import { getOpenApiSpec } from './config/openapi';
import { notFoundHandler, errorHandler } from './middleware/error';

const app: Application = express();

// Request tracking and structured logging
app.use(requestIdMiddleware);
app.use(httpLogger);

// Security headers and CORS middlewares
app.use(securityHeaders);
app.use(corsMiddleware);

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}
app.use(sessionMiddleware);

// Standard body parsers
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

// OpenAPI & Swagger UI (non-production)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.json(getOpenApiSpec());
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getOpenApiSpec()));
}

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Central Global Error Handler
app.use(errorHandler);

export { app };
export default app;
