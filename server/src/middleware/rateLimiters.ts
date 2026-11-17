import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';

export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.SENSITIVE_RATE_LIMIT || '100', 10),
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError(
        'Too many sensitive operations requested, please try again later',
        'RATE_LIMITED',
        429
      )
    );
  },
  validate: { default: false },
});

export const dunningLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.DUNNING_RATE_LIMIT || '10', 10),
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError(
        'Too many dunning dispatch requests, please try again later',
        'RATE_LIMITED',
        429
      )
    );
  },
  validate: { default: false },
});
