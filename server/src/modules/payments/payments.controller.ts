import { Request, Response, NextFunction } from 'express';
import { recordPayment, getInvoicePayments, voidPayment } from './payments.service';
import { recordPaymentSchema, voidPaymentSchema } from './payments.schemas';

const actorOf = (req: Request) => req.auth || (req as any).user;
const parseActor = (req: Request) => {
  const a = actorOf(req);
  return a ? { userId: (a.userId || a.id).toString(), role: a.role, employeeId: (a.employeeId || a.employee?.id)?.toString() } : undefined;
};

export async function createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = recordPaymentSchema.parse(req.body);
    const rawIdem = req.headers['idempotency-key'] || req.headers['Idempotency-Key'];
    const idempotencyKey = typeof rawIdem === 'string' && rawIdem.trim() ? rawIdem.trim().slice(0, 64) : undefined;

    const result = await recordPayment(
      req.params.id as string, data, parseActor(req),
      { ip: req.ip, requestId: (req as any).id }, idempotencyKey
    );

    res.status(result.httpStatus || 201).json({
      data: { ...result.payment, balance: result.newBalance, invoiceStatus: result.invoiceStatus },
      meta: { newBalance: result.newBalance, invoiceStatus: result.invoiceStatus },
    });
  } catch (err) { next(err); }
}

export async function listPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payments = await getInvoicePayments(req.params.id as string, parseActor(req), {
      ip: req.ip, requestId: (req as any).id,
    });
    res.status(200).json({ data: payments });
  } catch (err) { next(err); }
}

export async function voidPaymentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = voidPaymentSchema.parse(req.body);
    const result = await voidPayment(req.params.id as string, data, parseActor(req), {
      ip: req.ip, requestId: (req as any).id,
    });
    res.status(200).json({
      data: { ...result.payment, balance: result.newBalance, invoiceStatus: result.invoiceStatus },
      meta: { newBalance: result.newBalance, invoiceStatus: result.invoiceStatus },
    });
  } catch (err) { next(err); }
}
