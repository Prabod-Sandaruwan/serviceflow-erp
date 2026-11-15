import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import { ok } from '../../shared/http';

export async function getTaskStats(req: Request, res: Response, next: NextFunction) {
  try {
    const isStaff = req.auth?.role === 'STAFF';
    const where: any = {};
    if (isStaff && req.auth?.userId) {
      const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
      if (user?.employeeId) {
        where.assigneeId = user.employeeId;
      }
    }
    const grouped = await prisma.task.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });
    const stats = { todo: 0, inProgress: 0, done: 0, cancelled: 0, total: 0 };
    for (const g of grouped) {
      const count = g._count.id;
      stats.total += count;
      if (g.status === 'TODO') stats.todo = count;
      else if (g.status === 'IN_PROGRESS') stats.inProgress = count;
      else if (g.status === 'DONE') stats.done = count;
      else if (g.status === 'CANCELLED') stats.cancelled = count;
    }
    ok(res, stats);
  } catch (err) {
    next(err);
  }
}
