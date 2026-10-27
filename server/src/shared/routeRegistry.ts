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
  const stack = (router as any).stack || (router as any).router?.stack;
  if (stack?.length) {
    const last = stack[stack.length - 1];
    if (last?.route) (last.route as any)._roles = config.roles;
  }
}

export function assertAllRoutesRegistered(app: any): void {
  const stack = app._router?.stack || app.router?.stack || [];
  const extractedRoutes: RegisteredRoute[] = [];

  function traverse(layers: any[], prefix = '') {
    for (const layer of layers) {
      if (layer.route?.path) {
        let p = (prefix + layer.route.path).replace(/\/+/g, '/');
        if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
        const roles = (layer.route as any)._roles;
        for (const m of Object.keys(layer.route.methods || {})) {
          extractedRoutes.push({ method: m.toLowerCase(), path: p, roles });
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
          for (const pr of prefixes) {
            const res = layer.matchers[0](pr);
            if (res && res.path === pr) {
              routerPrefix = pr;
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
    if (r.roles === undefined) {
      throw new Error(
        `Startup Assertion Failed: Unregistered route ${r.method.toUpperCase()} ${r.path}`
      );
    }
  }
  registeredRoutes.length = 0;
  registeredRoutes.push(...apiV1Routes);
}
