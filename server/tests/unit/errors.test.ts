import { describe, it, expect } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { Prisma } from '../../src/generated/prisma';
import {
  AppError,
  BadRequestError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
} from '../../src/shared/errors';
import { notFoundHandler, errorHandler } from '../../src/middleware/error';

const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Simulate request ID middleware
  app.use((req: Request, _res: Response, next) => {
    const customHeader = req.headers['x-request-id'];
    if (customHeader) {
      (req as any).id = customHeader;
    }
    next();
  });

  // Test routes
  app.get('/test/bad-request', () => {
    throw new BadRequestError('Invalid parameter format');
  });

  app.get('/test/auth-error', () => {
    throw new AuthError('Token has expired');
  });

  app.get('/test/forbidden', () => {
    throw new ForbiddenError('Admin privileges required');
  });

  app.get('/test/not-found', () => {
    throw new NotFoundError('Employee not found');
  });

  app.get('/test/conflict', () => {
    throw new ConflictError('Invoice cannot be edited in current state', 'INVOICE_IMMUTABLE');
  });

  app.get('/test/validation-error', () => {
    throw new ValidationError('Validation failed', [
      { field: 'amount', issue: 'must be positive' },
    ]);
  });

  app.get('/test/rate-limited', () => {
    throw new RateLimitError('Too many login attempts. Please try again later.');
  });

  app.get('/test/custom-app-error', () => {
    throw new AppError(418, 'I_AM_A_TEAPOT', 'Short and stout');
  });

  app.post('/test/zod-error', (req: Request) => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().int().positive(),
    });
    schema.parse(req.body);
  });

  app.get('/test/prisma-p2002', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.10.1',
    });
    throw error;
  });

  app.get('/test/prisma-p2003', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: '7.10.1',
    });
    throw error;
  });

  app.get('/test/prisma-p2025', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '7.10.1',
    });
    throw error;
  });

  app.get('/test/internal-error', () => {
    throw new Error('SELECT * FROM confidential_users WHERE password_hash = "super_secret" failed');
  });

  // Mount error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Error Handling Middleware and AppError Classes', () => {
  const app = createTestApp();

  describe('AppError Subclasses', () => {
    it('handles BadRequestError with 400 and BAD_REQUEST code', async () => {
      const response = await request(app).get('/test/bad-request');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid parameter format',
        },
      });
    });

    it('handles AuthError with 401 and UNAUTHENTICATED code', async () => {
      const response = await request(app).get('/test/auth-error');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Token has expired',
        },
      });
    });

    it('handles ForbiddenError with 403 and FORBIDDEN code', async () => {
      const response = await request(app).get('/test/forbidden');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: {
          code: 'FORBIDDEN',
          message: 'Admin privileges required',
        },
      });
    });

    it('handles NotFoundError with 404 and NOT_FOUND code', async () => {
      const response = await request(app).get('/test/not-found');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Employee not found',
        },
      });
    });

    it('handles ConflictError with 409 and custom conflict code', async () => {
      const response = await request(app).get('/test/conflict');

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: {
          code: 'INVOICE_IMMUTABLE',
          message: 'Invoice cannot be edited in current state',
        },
      });
    });

    it('handles ValidationError with 422 and details array', async () => {
      const response = await request(app).get('/test/validation-error');

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [{ field: 'amount', issue: 'must be positive' }],
        },
      });
    });

    it('handles RateLimitError with 429 and RATE_LIMITED code', async () => {
      const response = await request(app).get('/test/rate-limited');

      expect(response.status).toBe(429);
      expect(response.body).toEqual({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many login attempts. Please try again later.',
        },
      });
    });

    it('handles custom AppError with specified status code and code', async () => {
      const response = await request(app).get('/test/custom-app-error');

      expect(response.status).toBe(418);
      expect(response.body).toEqual({
        error: {
          code: 'I_AM_A_TEAPOT',
          message: 'Short and stout',
        },
      });
    });
  });

  describe('Zod Validation Error Mapping', () => {
    it('converts ZodError to 422 with formatted details array', async () => {
      const response = await request(app)
        .post('/test/zod-error')
        .send({ email: 'invalid-email', age: -5 });

      expect(response.status).toBe(422);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message', 'Validation failed');
      expect(response.body.error.details).toBeInstanceOf(Array);
      expect(response.body.error.details.length).toBeGreaterThanOrEqual(2);
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'age' }),
        ])
      );
    });
  });

  describe('Prisma Error Mapping', () => {
    it('maps P2002 to 409 CONFLICT', async () => {
      const response = await request(app).get('/test/prisma-p2002');

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: {
          code: 'CONFLICT',
          message: 'A resource with this identifier already exists',
        },
      });
    });

    it('maps P2003 to 409 FOREIGN_KEY_VIOLATION', async () => {
      const response = await request(app).get('/test/prisma-p2003');

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Referenced record does not exist or cannot be modified',
        },
      });
    });

    it('maps P2025 to 404 NOT_FOUND', async () => {
      const response = await request(app).get('/test/prisma-p2025');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Requested record was not found',
        },
      });
    });
  });

  describe('Request ID forwarding', () => {
    it('includes requestId in error envelope when provided', async () => {
      const response = await request(app)
        .get('/test/not-found')
        .set('x-request-id', 'req-test-uuid-1234');

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('requestId', 'req-test-uuid-1234');
    });
  });

  describe('404 Not Found Handler', () => {
    it('returns standard 404 error envelope for nonexistent route', async () => {
      const response = await request(app).get('/nonexistent-path');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Route not found: GET /nonexistent-path',
        },
      });
    });
  });

  describe('Default / Unhandled Error (500)', () => {
    it('returns generic 500 INTERNAL_ERROR and does not leak stack trace or SQL', async () => {
      const response = await request(app).get('/test/internal-error');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
      });

      // Strict security assertion: no stack trace or SQL query text leaks
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body.error).not.toHaveProperty('stack');
      const serialized = JSON.stringify(response.body);
      expect(serialized).not.toContain('confidential_users');
      expect(serialized).not.toContain('super_secret');
      expect(serialized).not.toContain('SELECT');
    });
  });
});
