import { Request, Response, NextFunction } from 'express';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from './projects.schemas';
import { createProject, getProjects, getProjectById, updateProject } from './projects.service';
import { ok, paged } from '../../shared/http';

const actorOf = (req: Request) => req.auth || (req as any).user;
const ctxOf = (req: Request) => ({ ip: req.ip, requestId: req.id as string | undefined });

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listProjectsQuerySchema.parse(req.query);
    const result = await getProjects(query, actorOf(req));
    paged(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getProjectById(req.params.id as string, actorOf(req));
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

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

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateProjectSchema.parse(req.body);
    const result = await updateProject(req.params.id as string, parsed, actorOf(req), ctxOf(req));
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export const ProjectsController = { list, getById, create, update };
export default ProjectsController;
