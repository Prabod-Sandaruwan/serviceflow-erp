import { Router } from 'express';
import { UsersController } from './users.controller';
import { route } from '../../shared/routeRegistry';
import { registry } from '../../config/openapi';

const router = Router();

route(router, 'get', '/', {
  roles: ['ADMIN'],
  handler: UsersController.list,
});

route(router, 'post', '/', {
  roles: ['ADMIN'],
  handler: UsersController.create,
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

export const userRoutes = router;
export default router;
