import { Request, Response, NextFunction } from 'express';
import {
  createInvoice,
  updateInvoice,
  issueInvoice,
  cancelInvoice,
  getInvoices,
  getInvoiceById,
} from './invoices.service';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  issueInvoiceSchema,
  cancelInvoiceSchema,
  listInvoicesQuerySchema,
} from './invoices.schemas';
import { ok, paged } from '../../shared/http';

const actorOf = (req: Request) => req.auth || (req as any).user;

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listInvoicesQuerySchema.parse(req.query);
    const result = await getInvoices(query, actorOf(req));
    paged(res, result.data, result.meta);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getInvoiceById(req.params.id as string, actorOf(req));
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

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
