import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import prisma from './config/prisma';
import { requestIdMiddleware } from './middleware/requestId';
import { httpLogger } from './config/logger';
import { securityHeaders, corsMiddleware } from './middleware/security';
import { sessionMiddleware } from './middleware/session';
import { csrfMiddleware } from './middleware/csrf';
import { requireAuth } from './middleware/auth';
import { mustChangePasswordGuard } from './middleware/mustChangePassword';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/users.routes';
import { employeeRoutes } from './modules/employees/employees.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { getOpenApiSpec } from './config/openapi';
import { notFoundHandler, errorHandler } from './middleware/error';
import { route, assertAllRoutesRegistered } from './shared/routeRegistry';

const app: Application = express();

app.use(requestIdMiddleware);
app.use(httpLogger);
app.use(securityHeaders);
app.use(corsMiddleware);

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}
app.use(sessionMiddleware);
app.use(csrfMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth guard & routes
app.use('/api/v1', requireAuth);
app.use('/api/v1', mustChangePasswordGuard);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
route(app as any, 'post', '/api/v1/test-mutation', {
  roles: 'PUBLIC',
  handler: (_req: Request, res: Response) => res.status(200).json({ status: 'ok' }),
});
route(app as any, 'get', '/api/v1/test-protected', {
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  handler: (_req: Request, res: Response) => res.status(200).json({ status: 'ok' }),
});

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
route(app as any, 'get', '/api/v1/health', {
  roles: 'PUBLIC',
  handler: healthCheckHandler,
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/api-docs.json', (_req: Request, res: Response) => res.json(getOpenApiSpec()));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(getOpenApiSpec()));
}

app.use(notFoundHandler);
app.use(errorHandler);

assertAllRoutesRegistered(app);

export { app };
export default app;
