import { Request, Response, NextFunction } from 'express';
import { createInvoice, updateInvoice, issueInvoice, cancelInvoice } from './invoices.service';
import { createInvoiceSchema, updateInvoiceSchema, issueInvoiceSchema, cancelInvoiceSchema } from './invoices.schemas';

const actorOf = (req: Request) => {
  const u = req.auth || (req as any).user;
  return u ? { userId: u.userId ?? u.id, role: u.role } : undefined;
};

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const invoice = await createInvoice(data, actorOf(req), { ip: req.ip, requestId: (req as any).id });
    res.status(201).json({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateInvoiceSchema.parse(req.body);
    const invoice = await updateInvoice(req.params.id as string, data, actorOf(req), { ip: req.ip, requestId: (req as any).id });
    res.json({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function issue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = issueInvoiceSchema.parse(req.body);
    const invoice = await issueInvoice(req.params.id as string, data, actorOf(req), { ip: req.ip, requestId: (req as any).id });
    res.json({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = cancelInvoiceSchema.parse(req.body);
    const invoice = await cancelInvoice(req.params.id as string, data, actorOf(req), { ip: req.ip, requestId: (req as any).id });
    res.json({ data: invoice });
  } catch (err) {
    next(err);
  }
}
