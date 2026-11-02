import { Request, Response, NextFunction } from 'express';
import { createQuotationSchema } from './quotations.schemas';
import { createQuotation } from './quotations.service';

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

export const QuotationsController = { create };
export default QuotationsController;
