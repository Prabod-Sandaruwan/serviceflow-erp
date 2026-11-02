import { Router } from 'express';
import { list, getById, create, update, submit, approve, reject } from './quotations.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const approverRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), list] });
route(router, 'post', '/', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), create] });
route(router, 'get', '/:id', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), getById] });
route(router, 'patch', '/:id', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), update] });
route(router, 'post', '/:id/submit', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), submit] });
route(router, 'post', '/:id/approve', { roles: approverRoles, handler: [requireAuth, requireRole(approverRoles), approve] });
route(router, 'post', '/:id/reject', { roles: approverRoles, handler: [requireAuth, requireRole(approverRoles), reject] });

registry.registerPath({
  method: 'get', path: '/api/v1/quotations', summary: 'List quotations with filtering and pagination',
  responses: { 200: { description: 'Paginated list' }, 401: { description: 'Unauthenticated' } },
});
registry.registerPath({
  method: 'post', path: '/api/v1/quotations', summary: 'Create a quotation',
  responses: { 201: { description: 'Created' }, 401: { description: 'Unauthenticated' }, 422: { description: 'Validation error' } },
});
registry.registerPath({
  method: 'get', path: '/api/v1/quotations/{id}', summary: 'Get quotation details by ID',
  responses: { 200: { description: 'Quotation' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } },
});
registry.registerPath({
  method: 'patch', path: '/api/v1/quotations/{id}', summary: 'Update a DRAFT quotation',
  responses: { 200: { description: 'Updated' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' }, 409: { description: 'Conflict' } },
});
registry.registerPath({
  method: 'post', path: '/api/v1/quotations/{id}/submit', summary: 'Submit a quotation for approval',
  responses: { 200: { description: 'Submitted' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' }, 409: { description: 'Conflict' }, 422: { description: 'Validation error' } },
});
registry.registerPath({
  method: 'post', path: '/api/v1/quotations/{id}/approve', summary: 'Approve a quotation',
  responses: { 200: { description: 'Approved' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' }, 409: { description: 'Conflict' } },
});
registry.registerPath({
  method: 'post', path: '/api/v1/quotations/{id}/reject', summary: 'Reject a quotation with reason',
  responses: { 200: { description: 'Rejected' }, 401: { description: 'Unauthenticated' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' }, 409: { description: 'Conflict' }, 422: { description: 'Validation error' } },
});

export const quotationRoutes = router;
export default router;
