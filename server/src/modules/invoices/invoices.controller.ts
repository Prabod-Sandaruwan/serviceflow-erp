import { Request, Response, NextFunction } from 'express';
import { createInvoice } from './invoices.service';
import { createInvoiceSchema } from './invoices.schemas';

const actorOf = (req: Request) => {
  const u = req.auth || (req as any).user;
  return u ? { userId: u.userId ?? u.id, role: u.role } : undefined;
};

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const actor = actorOf(req);
    const ctx = { ip: req.ip, requestId: (req as any).id };
    const invoice = await createInvoice(data, actor, ctx);
    res.status(201).json({ data: invoice });
  } catch (err) {
    next(err);
  }
}
