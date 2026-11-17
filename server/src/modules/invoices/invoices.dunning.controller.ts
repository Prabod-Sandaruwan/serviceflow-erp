import { Request, Response, NextFunction } from 'express';
import { sendDunningNotices } from './invoices.dunning';

const actorOf = (req: Request) => (req as any).auth || (req as any).user;

export async function sendDunningHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const a = actorOf(req);
    const actor = {
      userId: (a.userId || a.id).toString(),
      role: a.role,
      employeeId: (a.employeeId || a.employee?.id)?.toString(),
    };
    const result = await sendDunningNotices(actor, req.ip, (req as any).id);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
