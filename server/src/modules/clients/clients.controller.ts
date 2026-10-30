import { Request, Response, NextFunction } from 'express';
import { clientQuerySchema, createClientSchema, updateClientSchema } from './clients.schemas';
import { listClients, getClient, createClient, updateClient } from './clients.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = clientQuerySchema.parse(req.query);
    const result = await listClients(parsedQuery);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getClient(req.params.id as string);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createClientSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await createClient(parsed, user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateClientSchema.parse(req.body);
    const user = req.auth || (req as any).user;
    const result = await updateClient(req.params.id as string, parsed, user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export const ClientsController = { list, getById, create, update };
export default ClientsController;
