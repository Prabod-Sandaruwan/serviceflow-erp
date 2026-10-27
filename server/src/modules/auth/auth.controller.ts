import { Request, Response, NextFunction } from 'express';
import util from 'util';
import crypto from 'crypto';
import { loginSchema, changePasswordSchema } from './auth.schemas';
import { AuthService } from './auth.service';
import { verifyPassword, hashPassword, validatePasswordPolicy } from './password';
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
      await util.promisify(req.session.regenerate.bind(req.session))();
      req.session.userId = profile.id.toString();
      req.session.role = profile.role;
      req.session.createdAt = Date.now();
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      await util.promisify(req.session.save.bind(req.session))();
      ok(res, profile);
    } catch (err) { next(err); }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId, role = req.session?.role;
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      if (userId) {
        await runInTransaction(async (tx) => {
          await AuditService.record(tx, {
            actor: { userId, role }, action: AUDIT_ACTIONS.LOGOUT,
            entityType: 'USER', entityId: userId, ip: req.ip, requestId: reqId,
          });
        });
      }
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('sf.sid');
        res.status(204).send();
      });
    } catch (err) { next(err); }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session?.userId) throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);
      const user = await prisma.user.findUnique({
        where: { id: BigInt(req.session.userId) }, include: { employee: true },
      });
      if (!user || !user.is_active) throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);
      const { password_hash, passwordHash, ...profile } = user as any;
      ok(res, profile);
    } catch (err) { next(err); }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse({ body: req.body }).body;
      if (currentPassword === newPassword) {
        throw new AppError('New password must be different', 'VALIDATION_ERROR', 422);
      }
      if (!req.auth?.userId) throw new AppError('Not authenticated', 'UNAUTHENTICATED', 401);
      const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
      if (!user) throw new AppError('Not authenticated', 'UNAUTHENTICATED', 401);
      const hash = user.password_hash || (user as any).passwordHash;
      if (!(await verifyPassword(hash, currentPassword))) {
        throw new AppError('Incorrect current password', 'VALIDATION_ERROR', 422);
      }
      if (validatePasswordPolicy(newPassword, user.email).length > 0) {
        throw new AppError('Password does not meet policy requirements', 'VALIDATION_ERROR', 422);
      }
      const newHash = await hashPassword(newPassword);
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      await runInTransaction(async (tx) => {
        await tx.user.update({ where: { id: user.id }, data: { password_hash: newHash, must_change_password: false } as any });
        await AuditService.record(tx, { actor: { userId: user.id, role: user.role }, action: AUDIT_ACTIONS.PASSWORD_CHANGED, entityType: 'USER', entityId: user.id, ip: req.ip, requestId: reqId });
      });
      try {
        await prisma.$executeRawUnsafe('DELETE FROM sessions WHERE data LIKE ? AND session_id != ?', `%"userId":"${user.id.toString()}"%`, req.sessionID);
      } catch {}
      if (req.auth) req.auth.mustChangePassword = false;
      res.status(204).send();
    } catch (err) { next(err); }
  }
}

export default AuthController;
