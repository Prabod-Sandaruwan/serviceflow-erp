import { Request, Response, NextFunction } from 'express';
import {
  createExpenseSchema,
  updateExpenseSchema,
  voidExpenseSchema,
  listExpensesQuerySchema,
} from './expenses.schemas';
import {
  createExpense,
  updateExpense,
  voidExpense,
  listExpenses,
} from './expenses.service';

const actorOf = (req: Request) => (req as any).auth || (req as any).user;
const parseActor = (req: Request) => {
  const a = actorOf(req);
  return a
    ? {
        userId: (a.userId || a.id).toString(),
        role: a.role,
        employeeId: (a.employeeId || a.employee?.id)?.toString(),
      }
    : undefined;
};

export async function createExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createExpenseSchema.parse(req.body);
    const result = await createExpense(input, parseActor(req), {
      ip: req.ip,
      requestId: (req as any).id,
    });
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateExpenseSchema.parse(req.body);
    const result = await updateExpense(req.params.id as string, input, parseActor(req), {
      ip: req.ip,
      requestId: (req as any).id,
    });
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function voidExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = voidExpenseSchema.parse(req.body);
    const result = await voidExpense(req.params.id as string, input, parseActor(req), {
      ip: req.ip,
      requestId: (req as any).id,
    });
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function listExpensesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listExpensesQuerySchema.parse(req.query);
    const result = await listExpenses(query, parseActor(req), {
      ip: req.ip,
      requestId: (req as any).id,
    });
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
