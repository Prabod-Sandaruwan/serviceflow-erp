import { Router } from 'express';
import { list, getById, create, update, issue, cancel, getPdf, stats } from './invoices.controller';
import { sendDunningHandler } from './invoices.dunning.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { sensitiveLimiter, dunningLimiter } from '../../middleware/rateLimiters';
import { route } from '../../shared/routeRegistry';
import { registerInvoiceOpenApi } from './invoices.openapi';

const router = Router();
const allRoles = ['ADMIN', 'MANAGER', 'STAFF'];
const managerRoles = ['ADMIN', 'MANAGER'];

route(router, 'get', '/stats', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), stats],
});
route(router, 'get', '/', { roles: allRoles, handler: [requireAuth, requireRole(allRoles), list] });
route(router, 'get', '/:id', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), getById],
});
route(router, 'get', '/:id/pdf', {
  roles: allRoles,
  handler: [requireAuth, requireRole(allRoles), sensitiveLimiter, getPdf],
});
route(router, 'post', '/dunning-notices', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), dunningLimiter, sendDunningHandler],
});
route(router, 'post', '/', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), create],
});
route(router, 'patch', '/:id', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), update],
});
route(router, 'post', '/:id/issue', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), issue],
});
route(router, 'post', '/:id/cancel', {
  roles: managerRoles,
  handler: [requireAuth, requireRole(managerRoles), cancel],
});

registerInvoiceOpenApi();

export const invoiceRoutes = router;
export default router;
