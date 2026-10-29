import { Router } from 'express';
import { list } from './clients.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();

route(router, 'get', '/', {
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  handler: [requireAuth, requireRole(['ADMIN', 'MANAGER', 'STAFF']), list],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/clients',
  summary: 'List clients with pagination and filtering',
  responses: {
    200: { description: 'Paginated client list returned' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
  },
});

export const clientRoutes = router;
export default router;

