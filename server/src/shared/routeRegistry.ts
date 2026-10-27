import { RequestHandler, Router } from 'express';
import { requireRole } from '../middleware/rbac';

export interface RouteConfig {
  roles: string[] | 'PUBLIC';
  handler: RequestHandler | RequestHandler[];
}

export interface RegisteredRoute {
  method: string;
  path: string;
  roles: string[] | 'PUBLIC';
}

export const registeredRoutes: RegisteredRoute[] = [];

export function route(
  router: Router,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  config: RouteConfig
): void {
  registeredRoutes.push({ method, path, roles: config.roles });
  const handlers = Array.isArray(config.handler) ? config.handler : [config.handler];
  const middleware =
    config.roles === 'PUBLIC' ? handlers : [requireRole(...config.roles), ...handlers];
  (router as any)[method](path, ...middleware);
}

export function assertAllRoutesRegistered(app: any): void {
  const stack = app._router?.stack || app.router?.stack || [];
  const extractedRoutes: Array<{ method: string; path: string }> = [];

  function traverse(layers: any[], prefix = '') {
    for (const layer of layers) {
      if (layer.route?.path) {
        const fullPath = (prefix + layer.route.path).replace(/\/+/g, '/');
        for (const method of Object.keys(layer.route.methods || {})) {
          extractedRoutes.push({ method: method.toLowerCase(), path: fullPath });
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        let routerPrefix = layer.path || '';
        if (!routerPrefix && layer.regexp?.source) {
          const match = layer.regexp.source.match(/\\\/(api\\\/v[0-9]+[a-zA-Z0-9_\/-]*)/);
          if (match) routerPrefix = '/' + match[1].replace(/\\\//g, '/');
        }
        if (!routerPrefix && layer.matchers?.[0]) {
          const prefixes = [
            '/api/v1/auth',
            '/api/v1/users',
            '/api/v1/employees',
            '/api/v1/audit-logs',
            '/api/v1',
          ];
          for (const p of prefixes) {
            const res = layer.matchers[0](p);
            if (res && res.path === p) {
              routerPrefix = p;
              break;
            }
          }
        }
        traverse(layer.handle.stack, prefix + routerPrefix);
      }
    }
  }

  traverse(stack);

  const apiV1Routes = extractedRoutes.filter((r) => r.path.startsWith('/api/v1'));
  for (const r of apiV1Routes) {
    const isRegistered = registeredRoutes.some(
      (reg) =>
        reg.method.toLowerCase() === r.method.toLowerCase() &&
        (reg.path === r.path || r.path.endsWith(reg.path))
    );
    if (!isRegistered) {
      throw new Error(
        `Startup Assertion Failed: Unregistered route ${r.method.toUpperCase()} ${r.path}`
      );
    }
  }
}
