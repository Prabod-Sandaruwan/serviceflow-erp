import { Router } from 'express';
import { list, getById, create, update, issue, cancel, getPdf, stats } from './invoices.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/stats', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), stats] });
route(router, 'get', '/', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), list] });
route(router, 'get', '/:id', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), getById] });
route(router, 'get', '/:id/pdf', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), getPdf] });
route(router, 'post', '/', { roles: managerRoles, handler: [requireAuth, requireRole(managerRoles), create] });
route(router, 'patch', '/:id', { roles: managerRoles, handler: [requireAuth, requireRole(managerRoles), update] });
route(router, 'post', '/:id/issue', { roles: managerRoles, handler: [requireAuth, requireRole(managerRoles), issue] });
route(router, 'post', '/:id/cancel', { roles: managerRoles, handler: [requireAuth, requireRole(managerRoles), cancel] });

registry.registerPath({
  method: 'get', path: '/api/v1/invoices', summary: 'List invoices',
  responses: { 200: { description: 'Invoices list' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'get', path: '/api/v1/invoices/{id}', summary: 'Get invoice details',
  responses: { 200: { description: 'Invoice details' }, 401: { description: 'Unauthenticated' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'get', path: '/api/v1/invoices/{id}/pdf', summary: 'Get invoice PDF',
  responses: { 200: { description: 'Invoice PDF' }, 401: { description: 'Unauthenticated' }, 404: { description: 'Not found' } },
});

registry.registerPath({
  method: 'post', path: '/api/v1/invoices', summary: 'Create invoice',
  responses: { 201: { description: 'Invoice created' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

registry.registerPath({
  method: 'patch', path: '/api/v1/invoices/{id}', summary: 'Update draft invoice',
  responses: { 200: { description: 'Invoice updated' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

registry.registerPath({
  method: 'post', path: '/api/v1/invoices/{id}/issue', summary: 'Issue draft invoice',
  responses: { 200: { description: 'Invoice issued' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

registry.registerPath({
  method: 'post', path: '/api/v1/invoices/{id}/cancel', summary: 'Cancel invoice',
  responses: { 200: { description: 'Invoice cancelled' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' } },
});

export const invoiceRoutes = router;
export default router;
