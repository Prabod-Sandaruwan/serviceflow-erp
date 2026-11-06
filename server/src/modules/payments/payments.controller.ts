import { Request, Response, NextFunction } from 'express';
import { recordPayment } from './payments.service';
import { recordPaymentSchema } from './payments.schemas';

const actorOf = (req: Request) => req.auth || (req as any).user;

export async function createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = recordPaymentSchema.parse(req.body);
    const rawIdem = req.headers['idempotency-key'] || req.headers['Idempotency-Key'];
    const idempotencyKey = typeof rawIdem === 'string' && rawIdem.trim()
      ? rawIdem.trim().slice(0, 64)
      : undefined;

    const actor = actorOf(req);
    const actorParam = actor
      ? {
          userId: (actor.userId || actor.id).toString(),
          role: actor.role,
          employeeId: (actor.employeeId || (actor as any).employee?.id)?.toString(),
        }
      : undefined;

    const result = await recordPayment(
      req.params.id as string,
      data,
      actorParam,
      { ip: req.ip, requestId: (req as any).id },
      idempotencyKey
    );

    res.status(result.httpStatus || 201).json({
      data: {
        ...result.payment,
        balance: result.newBalance,
        invoiceStatus: result.invoiceStatus,
      },
      meta: {
        newBalance: result.newBalance,
        invoiceStatus: result.invoiceStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}
