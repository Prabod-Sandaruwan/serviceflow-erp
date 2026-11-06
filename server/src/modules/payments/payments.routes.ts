import { Router } from 'express';
import { createPayment, listPayments, voidPaymentHandler } from './payments.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/invoices/:id/payments', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), listPayments],
});

route(router, 'post', '/invoices/:id/payments', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), createPayment],
});

route(router, 'post', '/payments/:id/void', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), voidPaymentHandler],
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/invoices/{id}/payments',
  summary: 'Get invoice payment history',
  responses: { 200: { description: 'Invoice payment history' }, 401: { description: 'Unauthenticated' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/invoices/{id}/payments',
  summary: 'Record invoice payment',
  responses: { 201: { description: 'Payment recorded' }, 422: { description: 'Validation error' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/payments/{id}/void',
  summary: 'Void payment and rollback invoice status',
  responses: { 200: { description: 'Payment voided' }, 403: { description: 'Forbidden' }, 409: { description: 'Already voided' } },
});

export const paymentRoutes = router;
export default router;
