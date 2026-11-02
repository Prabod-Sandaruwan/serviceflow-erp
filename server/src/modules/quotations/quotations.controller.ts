import { Request, Response, NextFunction } from 'express';
import { createQuotationSchema, listQuotationsQuerySchema, updateQuotationSchema } from './quotations.schemas';
import { createQuotation, getQuotations, getQuotationById, updateQuotation } from './quotations.service';
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

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateQuotationSchema.parse(req.body);
    const actor = req.auth || (req as any).user;
    const result = await updateQuotation(req.params.id as string, parsed, actor, {
      ip: req.ip,
      requestId: req.id as string | undefined,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export const QuotationsController = { list, getById, create, update };
export default QuotationsController;
