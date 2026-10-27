import { Request, Response, NextFunction } from 'express';
import { listAuditLogsQuerySchema } from './audit.schemas';
import { AuditService } from './audit.service';
import { paged } from '../../shared/http';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listAuditLogsQuerySchema.parse(req.query);
      const result = await AuditService.listLogs(query);
      paged(res, result.data, {
        page: result.meta.page,
        pageSize: result.meta.pageSize,
        total: result.meta.total,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuditController;
