import { Request, Response, NextFunction } from 'express';
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from './tasks.schemas';
import { createTask, updateTask, getTasks } from './tasks.service';
import { ok, paged } from '../../shared/http';

const actorOf = (req: Request) => req.auth || (req as any).user;

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listTasksQuerySchema.parse(req.query);
    const result = await getTasks(query, actorOf(req));
    paged(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function listByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listTasksQuerySchema.parse({ ...req.query, projectId: req.params.id });
    const result = await getTasks(query, actorOf(req));
    paged(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

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

export const TasksController = { list, listByProject, create, update };
export default TasksController;
