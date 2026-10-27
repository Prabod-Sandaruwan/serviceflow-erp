import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT || '5', 10),
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    const email = req.body?.email?.toString().toLowerCase().trim() || 'unknown';
    return `${req.ip}-${email}`;
  },
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Too many failed login attempts', 'RATE_LIMITED', 429));
  },
  validate: { default: false },
});

export default loginLimiter;
