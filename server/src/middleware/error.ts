import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma';
import { AppError, ErrorDetail } from '../shared/errors';

export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId =
    (req as any).id || (req.headers['x-request-id'] as string) || undefined;

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      ...(requestId ? { requestId } : {}),
    },
  });
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  void _next;
  const requestId =
    (req as any).id || (req.headers['x-request-id'] as string) || undefined;

  // Case 1: Known Application Errors (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && (Array.isArray(err.details) ? err.details.length > 0 : true) ? { details: err.details } : {}),
        ...(requestId ? { requestId } : {}),
      },
    });
    return;
  }

  // Case 2: Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const details: ErrorDetail[] = err.issues.map((i) => ({
      field: i.path.length > 0 ? i.path.join('.') : undefined,
      issue: i.message,
    }));

    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
        ...(requestId ? { requestId } : {}),
      },
    });
    return;
  }

  // Case 3: Prisma Known Database Errors
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    (err && typeof err === 'object' && typeof err.code === 'string' && err.code.startsWith('P'))
  ) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'A resource with this identifier already exists',
          ...(requestId ? { requestId } : {}),
        },
      });
      return;
    }

    if (err.code === 'P2003') {
      res.status(409).json({
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Referenced record does not exist or cannot be modified',
          ...(requestId ? { requestId } : {}),
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Requested record was not found',
          ...(requestId ? { requestId } : {}),
        },
      });
      return;
    }
  }

  // Case 4: Default Unhandled / Internal Errors
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled server error:', err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      ...(requestId ? { requestId } : {}),
    },
  });
};

export default errorHandler;
