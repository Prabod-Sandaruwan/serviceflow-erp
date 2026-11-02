import { Router } from 'express';
import { list, getById, create } from './quotations.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const roles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'get', '/', { roles, handler: [requireAuth, requireRole(roles), list] });
route(router, 'post', '/', { roles, handler: [requireAuth, requireRole(roles), create] });
route(router, 'get', '/:id', { roles, handler: [requireAuth, requireRole(roles), getById] });

registry.registerPath({
  method: 'get',
  path: '/api/v1/quotations',
  summary: 'List quotations with filtering and pagination',
  responses: { 200: { description: 'Paginated quotations list' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/quotations',
  summary: 'Create a quotation',
  responses: { 201: { description: 'Quotation created' }, 401: { description: 'Unauthenticated' }, 422: { description: 'Validation error' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/quotations/{id}',
  summary: 'Get quotation details by ID',
  responses: { 200: { description: 'Quotation details' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
});

export const quotationRoutes = router;
export default router;
