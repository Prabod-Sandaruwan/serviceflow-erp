import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';

export function mustChangePasswordGuard(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (!req.auth || !req.auth.mustChangePassword) {
      return next();
    }

    const allowPaths = ['/auth/me', '/auth/logout', '/auth/change-password', '/auth/me/password'];
    const isAllowed = allowPaths.some((p) => req.path.endsWith(p));

    if (!isAllowed) {
      throw new AppError('Password change required', 'PASSWORD_CHANGE_REQUIRED', 403);
    }

    next();
  } catch (err) {
    next(err);
  }
}

export default mustChangePasswordGuard;
