import { Request, Response, NextFunction } from 'express';
import { clientQuerySchema } from './clients.schemas';
import { listClients } from './clients.service';

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsedQuery = clientQuerySchema.parse(req.query);
    const result = await listClients(parsedQuery);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export const ClientsController = { list };
export default { list };

