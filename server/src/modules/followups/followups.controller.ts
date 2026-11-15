import { Request, Response, NextFunction } from 'express';
import {
  followUpQuerySchema,
  createFollowUpSchema,
  updateFollowUpSchema,
} from './followups.schemas';
import { listFollowUps, createFollowUp, updateFollowUp } from './followups.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = followUpQuerySchema.parse(req.query);
    const user = req.auth || (req as any).user;
    const result = await listFollowUps(parsedQuery, user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createFollowUpSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await createFollowUp(parsed, user);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateFollowUpSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await updateFollowUp(req.params.id as string, parsed, user);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export const FollowUpsController = { list, create, update };
export default FollowUpsController;
