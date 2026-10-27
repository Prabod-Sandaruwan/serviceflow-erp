import { Router } from 'express';
import { AuditController } from './audit.controller';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();

route(router, 'get', '/', {
  roles: ['ADMIN'],
  handler: AuditController.list,
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/audit-logs',
  summary: 'List audit logs with filtering and pagination',
  responses: {
    200: { description: 'Paginated audit logs returned' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
  },
});

export const auditRoutes = router;
export default router;
