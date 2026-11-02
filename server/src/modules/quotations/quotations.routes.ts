import { Router } from 'express';
import { create } from './quotations.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const roles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'post', '/', { roles, handler: [requireAuth, requireRole(roles), create] });

registry.registerPath({
  method: 'post',
  path: '/api/v1/quotations',
  summary: 'Create a quotation',
  responses: {
    201: { description: 'Quotation created successfully' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    422: { description: 'Validation error' },
  },
});

export const quotationRoutes = router;
export default router;
