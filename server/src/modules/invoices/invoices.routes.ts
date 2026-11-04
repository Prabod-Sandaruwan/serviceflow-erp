import { Router } from 'express';
import { create } from './invoices.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'post', '/', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
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
    409: { description: 'Conflict: milestone not approved, project cancelled, or invoice already exists' },
  },
});

export const invoiceRoutes = router;
export default router;

