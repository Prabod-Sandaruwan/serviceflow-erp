import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import { ok } from '../../shared/http';
import { AppError } from '../../shared/errors';
import { purgeUserSessions } from './sessionCleanup';

export class AuthMeController {
  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId || req.auth?.userId;
      if (!userId) throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);
      const { fullName, phone, jobTitle } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: { employee: true },
      });
      if (!user || !user.is_active) throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);

      if (user.employeeId) {
        await prisma.employee.update({
          where: { id: user.employeeId },
          data: {
            ...(fullName ? { full_name: fullName.trim() } : {}),
            ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
            ...(jobTitle !== undefined ? { job_title: jobTitle ? jobTitle.trim() : null } : {}),
          },
        });
      } else if (fullName) {
        const emp = await prisma.employee.create({
          data: {
            full_name: fullName.trim(),
            phone: phone ? phone.trim() : null,
            job_title: jobTitle ? jobTitle.trim() : null,
          },
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { employeeId: emp.id },
        });
      }

      const updated = await prisma.user.findUnique({
        where: { id: user.id },
        include: { employee: true },
      });
      const { password_hash, passwordHash, ...profile } = updated as any;
      ok(res, profile);
    } catch (err) {
      next(err);
    }
  }

  static async logoutOtherSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session?.userId || req.auth?.userId;
      if (!userId) throw new AppError('UNAUTHENTICATED', 'UNAUTHENTICATED', 401);
      const count = await purgeUserSessions(BigInt(userId), req.sessionID);
      ok(res, { count, message: 'All other sessions terminated successfully' });
    } catch (err) {
      next(err);
    }
  }
}
