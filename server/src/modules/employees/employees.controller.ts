import { Request, Response, NextFunction } from 'express';
import {
  createEmployeeSchema,
  listEmployeesQuerySchema,
  updateEmployeeSchema,
} from './employees.schemas';
import { EmployeesService } from './employees.service';
import { created, ok, paged } from '../../shared/http';

export class EmployeesController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { body: input } = createEmployeeSchema.parse({ body: req.body });
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      const actor = req.auth ? { userId: req.auth.userId, role: req.auth.role } : undefined;
      const employee = await EmployeesService.create(input, actor, req.ip, reqId);
      created(res, employee);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listEmployeesQuerySchema.parse(req.query);
      const result = await EmployeesService.list(query);
      paged(res, result.data, {
        page: result.meta.page,
        pageSize: result.meta.pageSize,
        total: result.meta.total,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      const { body: input } = updateEmployeeSchema.parse({ body: req.body });
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      const actor = req.auth ? { userId: req.auth.userId, role: req.auth.role } : undefined;
      const employee = await EmployeesService.update(id, input, actor, req.ip, reqId);
      ok(res, employee);
    } catch (err) {
      next(err);
    }
  }
}

export default EmployeesController;
