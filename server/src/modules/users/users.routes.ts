import { Router } from 'express';
import { UsersController } from './users.controller';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();

route(router, 'get', '/', { roles: ['ADMIN'], handler: UsersController.list });
route(router, 'post', '/', { roles: ['ADMIN'], handler: UsersController.create });
route(router, 'patch', '/:id', { roles: ['ADMIN'], handler: UsersController.update });
route(router, 'post', '/:id/reset-password', {
  roles: ['ADMIN'],
  handler: UsersController.resetPassword,
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/users',
  summary: 'List users with pagination and filtering',
  responses: {
    200: { description: 'Paginated user list returned' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/users',
  summary: 'Create a new user',
  responses: {
    201: { description: 'User created' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
    409: { description: 'Email already exists' },
    422: { description: 'Validation error' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/{id}',
  summary: 'Update user role or active status',
  responses: {
    200: { description: 'User updated' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
    404: { description: 'User not found' },
    409: { description: 'Conflict' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/users/{id}/reset-password',
  summary: 'Reset user password',
  responses: {
    204: { description: 'Password reset' },
    401: { description: 'Unauthenticated' },
    403: { description: 'Forbidden - Admin only' },
    404: { description: 'User not found' },
  },
});

export const userRoutes = router;
export default router;
