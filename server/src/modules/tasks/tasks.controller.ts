import { Request, Response, NextFunction } from 'express';
import { createTaskSchema, updateTaskSchema } from './tasks.schemas';
import { createTask, updateTask } from './tasks.service';
import { ok } from '../../shared/http';

const actorOf = (req: Request) => req.auth || (req as any).user;

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createTaskSchema.parse(req.body);
    const result = await createTask(req.params.id as string, parsed, actorOf(req));
    res.setHeader('Location', `/api/v1/tasks/${result.id}`);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateTaskSchema.parse(req.body);
    const result = await updateTask(req.params.id as string, parsed, actorOf(req));
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export const TasksController = { create, update };
export default TasksController;
