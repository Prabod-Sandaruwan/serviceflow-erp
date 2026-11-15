import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { CLIENT_ORIGIN } from './security';
import { AppError } from '../shared/errors';

export function ensureCsrfToken(req: Request): string {
  if (!req.session) {
    throw new AppError('Session not initialized', 'SESSION_REQUIRED', 500);
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

export function csrfMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  if (!origin || typeof origin !== 'string' || !origin.startsWith(CLIENT_ORIGIN)) {
    return next(new AppError('Invalid Origin', 'CSRF_INVALID', 403));
  }

  const headerToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!headerToken || typeof headerToken !== 'string' || !sessionToken) {
    return next(new AppError('Invalid CSRF token', 'CSRF_INVALID', 403));
  }

  const headerBuf = Buffer.from(headerToken);
  const sessionBuf = Buffer.from(sessionToken);

  if (headerBuf.length !== sessionBuf.length || !crypto.timingSafeEqual(headerBuf, sessionBuf)) {
    return next(new AppError('Invalid CSRF token', 'CSRF_INVALID', 403));
  }

  next();
}

export default csrfMiddleware;
