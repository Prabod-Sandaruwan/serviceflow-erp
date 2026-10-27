import { Request, Response, NextFunction } from 'express';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  resetPasswordSchema,
} from './users.schemas';
import { UsersService } from './users.service';
import { created, ok, paged } from '../../shared/http';

export class UsersController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { body: input } = createUserSchema.parse({ body: req.body });
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      const actor = req.auth ? { userId: req.auth.userId, role: req.auth.role } : undefined;
      const user = await UsersService.createUser(input, actor, req.ip, reqId);
      created(res, user);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listUsersQuerySchema.parse(req.query);
      const result = await UsersService.listUsers(query);
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
      const id = BigInt(req.params.id as string);
      const { body: input } = updateUserSchema.parse({ body: req.body });
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      const actor = req.auth ? { userId: req.auth.userId, role: req.auth.role } : undefined;
      const user = await UsersService.updateUser(id, input, actor, req.ip, reqId);
      ok(res, user);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = BigInt(req.params.id as string);
      const { body: input } = resetPasswordSchema.parse({ body: req.body });
      const reqId = (req as any).id || (req.headers['x-request-id'] as string);
      const actor = req.auth ? { userId: req.auth.userId, role: req.auth.role } : undefined;
      await UsersService.resetPassword(id, input.tempPassword, actor, req.ip, reqId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export default UsersController;
