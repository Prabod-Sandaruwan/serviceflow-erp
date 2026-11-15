import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../shared/errors';

const destroySession = (session: any): Promise<void> => {
  return new Promise((resolve) => {
    session.destroy(() => resolve());
  });
};

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const skipPaths = ['/auth/login', '/auth/csrf', '/auth/logout', '/health', '/test-mutation'];
    if (skipPaths.includes(req.path)) {
      return next();
    }

    if (!req.session?.userId || !req.session?.createdAt) {
      throw new AppError('Not authenticated', 'UNAUTHENTICATED', 401);
    }

    if (Date.now() - req.session.createdAt > 24 * 60 * 60 * 1000) {
      await destroySession(req.session);
      res.clearCookie('sf.sid');
      throw new AppError('Session expired', 'UNAUTHENTICATED', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(req.session.userId) },
    });

    const isActive = user?.is_active ?? (user as any)?.isActive;
    if (!user || !isActive) {
      await destroySession(req.session);
      res.clearCookie('sf.sid');
      throw new AppError('User deactivated or not found', 'UNAUTHENTICATED', 401);
    }

    req.auth = {
      userId: user.id,
      role: user.role,
      employeeId: user.employeeId,
      mustChangePassword: user.must_change_password ?? (user as any).mustChangePassword ?? false,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export { requireRole } from './rbac';
export default requireAuth;
