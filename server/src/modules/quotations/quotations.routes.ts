import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  submit,
  approve,
  reject,
  revise,
  send,
  respond,
  getPdf,
} from './quotations.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { sensitiveLimiter } from '../../middleware/rateLimiters';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const approverRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), list] });
route(router, 'post', '/', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), create],
});
route(router, 'get', '/:id', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), getById],
});
route(router, 'get', '/:id/pdf', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), sensitiveLimiter, getPdf],
});
route(router, 'patch', '/:id', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), update],
});
route(router, 'post', '/:id/submit', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), submit],
});
route(router, 'post', '/:id/approve', {
  roles: approverRoles,
  handler: [requireAuth, requireRole(approverRoles), approve],
});
route(router, 'post', '/:id/reject', {
  roles: approverRoles,
  handler: [requireAuth, requireRole(approverRoles), reject],
});
route(router, 'post', '/:id/revise', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), revise],
});
route(router, 'post', '/:id/send', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), send],
});
route(router, 'post', '/:id/respond', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), respond],
});

const reg = (m: 'get' | 'post' | 'patch', p: string, s: string) =>
  registry.registerPath({
    method: m,
    path: `/api/v1/quotations${p}`,
    summary: s,
    responses: {
      200: { description: 'Success' },
      201: { description: 'Created' },
      401: { description: 'Unauthenticated' },
      403: { description: 'Forbidden' },
      404: { description: 'Not found' },
      409: { description: 'Conflict' },
      422: { description: 'Validation error' },
    },
  });

reg('get', '', 'List quotations with filtering and pagination');
reg('post', '', 'Create a quotation');
reg('get', '/{id}', 'Get quotation details by ID');
reg('get', '/{id}/pdf', 'Download quotation PDF');
reg('patch', '/{id}', 'Update a DRAFT quotation');
reg('post', '/{id}/submit', 'Submit a quotation for approval');
reg('post', '/{id}/approve', 'Approve a quotation');
reg('post', '/{id}/reject', 'Reject a quotation with reason');
reg('post', '/{id}/revise', 'Revise a rejected, declined, or expired quotation');
reg('post', '/{id}/send', 'Send an approved quotation to client');
reg('post', '/{id}/respond', 'Record client acceptance or decline');

export const quotationRoutes = router;
export default router;
