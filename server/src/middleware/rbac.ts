import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      throw new AppError('Not authenticated', 'UNAUTHENTICATED', 401);
    }
    if (!allowedRoles.includes(req.auth.role)) {
      throw new AppError('Forbidden', 'FORBIDDEN', 403);
    }
    next();
  };
}

export default requireRole;
