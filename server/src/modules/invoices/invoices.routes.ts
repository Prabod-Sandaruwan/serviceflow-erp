import { Router } from 'express';
import { create, update } from './invoices.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'post', '/', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});

route(router, 'patch', '/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), update],
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/invoices',
  summary: 'Create invoice from eligible milestone',
  responses: {
    201: { description: 'Invoice created' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Milestone not found' },
    409: { description: 'Conflict' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/invoices/{id}',
  summary: 'Update draft invoice',
  responses: {
    200: { description: 'Invoice updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Invoice not found' },
    409: { description: 'Conflict: Invoice is immutable' },
  },
});

export const invoiceRoutes = router;
export default router;
