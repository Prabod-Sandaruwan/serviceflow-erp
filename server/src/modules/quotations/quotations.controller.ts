import { Request, Response, NextFunction } from 'express';
import { createQuotationSchema, listQuotationsQuerySchema, updateQuotationSchema, rejectQuotationSchema, respondQuotationSchema } from './quotations.schemas';
import { createQuotation, getQuotations, getQuotationById, updateQuotation, submitQuotation, approveQuotation, rejectQuotation, reviseQuotation, sendQuotation, respondQuotation } from './quotations.service';
import { paged } from '../../shared/http';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listQuotationsQuerySchema.parse(req.query);
    const result = await getQuotations(query, req.auth || (req as any).user);
    paged(res, result.data, result.meta);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getQuotationById(req.params.id as string, req.auth || (req as any).user);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createQuotationSchema.parse(req.body);
    const result = await createQuotation(parsed, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.setHeader('Location', `/api/v1/quotations/${result.id}`);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateQuotationSchema.parse(req.body);
    const result = await updateQuotation(req.params.id as string, parsed, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await submitQuotation(req.params.id as string, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function approve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await approveQuotation(req.params.id as string, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = rejectQuotationSchema.parse(req.body);
    const result = await rejectQuotation(req.params.id as string, parsed.reason, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function revise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await reviseQuotation(req.params.id as string, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function send(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await sendQuotation(req.params.id as string, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function respond(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = respondQuotationSchema.parse(req.body);
    const result = await respondQuotation(req.params.id as string, parsed, req.auth || (req as any).user, { ip: req.ip, requestId: req.id as string });
    res.json({ data: result });
  } catch (err) { next(err); }
}

export const QuotationsController = { list, getById, create, update, submit, approve, reject, revise, send, respond };
export default QuotationsController;
