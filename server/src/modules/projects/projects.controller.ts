import { Request, Response, NextFunction } from 'express';
import { createProjectSchema } from './projects.schemas';
import { createProject } from './projects.service';

const actorOf = (req: Request) => req.auth || (req as any).user;
const ctxOf = (req: Request) => ({ ip: req.ip, requestId: req.id as string | undefined });

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createProjectSchema.parse(req.body);
    const result = await createProject(parsed, actorOf(req), ctxOf(req));
    res.setHeader('Location', `/api/v1/projects/${result.id}`);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

