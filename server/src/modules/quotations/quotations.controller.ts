import { Request, Response, NextFunction } from 'express';
import { createQuotationSchema, listQuotationsQuerySchema } from './quotations.schemas';
import { createQuotation, getQuotations, getQuotationById } from './quotations.service';
import { paged } from '../../shared/http';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listQuotationsQuerySchema.parse(req.query);
    const actor = req.auth || (req as any).user;
    const result = await getQuotations(query, actor);
    paged(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = req.auth || (req as any).user;
    const result = await getQuotationById(req.params.id as string, actor);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createQuotationSchema.parse(req.body);
    const actor = req.auth || (req as any).user;
    const result = await createQuotation(parsed, actor, {
      ip: req.ip,
      requestId: req.id as string | undefined,
    });
    res.setHeader('Location', `/api/v1/quotations/${result.id}`);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export const QuotationsController = { list, getById, create };
export default QuotationsController;
