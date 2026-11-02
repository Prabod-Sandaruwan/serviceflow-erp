import { Request, Response, NextFunction } from 'express';
import { createQuotationSchema, listQuotationsQuerySchema, updateQuotationSchema, rejectQuotationSchema, respondQuotationSchema } from './quotations.schemas';
import { createQuotation, getQuotations, getQuotationById, updateQuotation, submitQuotation, approveQuotation, rejectQuotation, reviseQuotation, sendQuotation, respondQuotation } from './quotations.service';
import { buildQuotationPdf } from './quotation.pdf';
import { paged } from '../../shared/http';

const actorOf = (req: Request) => req.auth || (req as any).user;
const ctxOf = (req: Request) => ({ ip: req.ip, requestId: req.id as string | undefined });

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listQuotationsQuerySchema.parse(req.query);
    const result = await getQuotations(query, actorOf(req));
    paged(res, result.data, result.meta);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ data: await getQuotationById(req.params.id as string, actorOf(req)) }); } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createQuotationSchema.parse(req.body);
    const result = await createQuotation(parsed, actorOf(req), ctxOf(req));
    res.setHeader('Location', `/api/v1/quotations/${result.id}`);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateQuotationSchema.parse(req.body);
    res.json({ data: await updateQuotation(req.params.id as string, parsed, actorOf(req), ctxOf(req)) });
  } catch (err) { next(err); }
}

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ data: await submitQuotation(req.params.id as string, actorOf(req), ctxOf(req)) }); } catch (err) { next(err); }
}

export async function approve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ data: await approveQuotation(req.params.id as string, actorOf(req), ctxOf(req)) }); } catch (err) { next(err); }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = rejectQuotationSchema.parse(req.body);
    res.json({ data: await rejectQuotation(req.params.id as string, parsed.reason, actorOf(req), ctxOf(req)) });
  } catch (err) { next(err); }
}

export async function revise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ data: await reviseQuotation(req.params.id as string, actorOf(req), ctxOf(req)) }); } catch (err) { next(err); }
}

export async function send(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ data: await sendQuotation(req.params.id as string, actorOf(req), ctxOf(req)) }); } catch (err) { next(err); }
}

export async function respond(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = respondQuotationSchema.parse(req.body);
    res.json({ data: await respondQuotation(req.params.id as string, parsed, actorOf(req), ctxOf(req)) });
  } catch (err) { next(err); }
}

export async function getPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = await getQuotationById(req.params.id as string, actorOf(req));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${q.quotationNumber}.pdf"`);
    buildQuotationPdf({
      quotationNumber: q.quotationNumber, clientName: q.clientName || `Client #${q.clientId}`,
      items: (q.items || []).map((it: any) => ({
        description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, lineAmount: it.lineAmount,
      })), subtotal: q.subtotal, taxAmount: q.taxAmount, total: q.total, status: q.status, validUntil: q.validUntil,
    }, res);
  } catch (err) { next(err); }
}

export const QuotationsController = { list, getById, create, update, submit, approve, reject, revise, send, respond, getPdf };
export default QuotationsController;
