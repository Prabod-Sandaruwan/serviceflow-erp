import { Router } from 'express';
import { createPayment } from './payments.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];

route(router, 'post', '/invoices/:id/payments', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), createPayment],
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/invoices/{id}/payments',
  summary: 'Record invoice payment',
  responses: {
    201: { description: 'Payment recorded' },
    400: { description: 'Bad request' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden' },
    404: { description: 'Invoice not found' },
    409: { description: 'Invoice status not payable' },
    422: { description: 'Validation error or overpayment' },
  },
});

export const paymentRoutes = router;
export default router;
