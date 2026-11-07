import { Request, Response, NextFunction } from 'express';
import { reportDateRangeSchema } from '../reports/reports.schemas';
import { getDashboardSummary } from './dashboard.service';

const actorOf = (req: Request) => (req as any).auth || (req as any).user;
const parseActor = (req: Request) => {
  const a = actorOf(req);
  return a
    ? {
        userId: (a.userId || a.id).toString(),
        role: a.role,
        employeeId: (a.employeeId || a.employee?.id)?.toString(),
      }
    : undefined;
};

export async function getDashboardSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportDateRangeSchema.parse(req.query);
    const actor = parseActor(req);
    const result = await getDashboardSummary(query, actor);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
