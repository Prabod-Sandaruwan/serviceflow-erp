import { Request, Response, NextFunction } from 'express';
import util from 'util';
import crypto from 'crypto';
import { loginSchema } from './auth.schemas';
import { AuthService } from './auth.service';
import { AppError } from '../../shared/errors';
import { ok } from '../../shared/http';
import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { body: input } = loginSchema.parse({ body: req.body });
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      const profile = await AuthService.login(input, req.ip, reqId);

      const regenerate = util.promisify(req.session.regenerate.bind(req.session));
      const save = util.promisify(req.session.save.bind(req.session));

      await regenerate();
      req.session.userId = profile.id.toString();
      req.session.role = profile.role;
      req.session.createdAt = Date.now();
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      await save();

      ok(res, profile);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId;
      const role = req.session?.role;
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);

      if (userId) {
        await runInTransaction(async (tx) => {
          await AuditService.record(tx, {
            actor: { userId, role },
            action: AUDIT_ACTIONS.LOGOUT,
            entityType: 'USER',
            entityId: userId,
            ip: req.ip,
            requestId: reqId,
          });
        });
      }

      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('sf.sid');
        res.status(204).send();
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session?.userId) {
        throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: BigInt(req.session.userId) },
        include: { employee: true },
      });

      if (!user || !user.is_active) {
        throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);
      }

      const userObj = user as any;
      const { password_hash, passwordHash, ...profile } = userObj;
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
