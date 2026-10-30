import { Request, Response, NextFunction } from 'express';
import {
  leadQuerySchema,
  createLeadSchema,
  updateLeadSchema,
  convertLeadSchema,
} from './leads.schemas';
import {
  listLeads,
  getLead,
  createLead,
  updateLead,
  convertLead,
} from './leads.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = leadQuerySchema.parse(req.query);
    const user = req.auth || (req as any).user;
    const result = await listLeads(parsedQuery, user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.auth || (req as any).user;
    const result = await getLead(req.params.id as string, user);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createLeadSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await createLead(parsed, user);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateLeadSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await updateLead(req.params.id as string, parsed, user);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function convert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = convertLeadSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await convertLead(req.params.id as string, parsed, user);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export const LeadsController = { list, getById, create, update, convert };
export default LeadsController;
