import { Request, Response, NextFunction } from 'express';
import { createMilestoneSchema, updateMilestoneSchema } from './milestones.schemas';
import { createMilestone, updateMilestone } from './milestones.service';
import { ok } from '../../shared/http';

const actorOf = (req: Request) => req.auth || (req as any).user;
const ctxOf = (req: Request) => ({ ip: req.ip, requestId: req.id as string | undefined });

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createMilestoneSchema.parse(req.body);
    const result = await createMilestone(req.params.id as string, parsed, actorOf(req), ctxOf(req));
    res.setHeader('Location', `/api/v1/milestones/${result.id}`);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateMilestoneSchema.parse(req.body);
    const result = await updateMilestone(req.params.id as string, parsed, actorOf(req), ctxOf(req));
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export const MilestonesController = { create, update };
export default MilestonesController;
