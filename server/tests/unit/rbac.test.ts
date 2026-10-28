import { describe, it, expect } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import { requireRole } from '../../src/middleware/rbac';
import { route, assertAllRoutesRegistered } from '../../src/shared/routeRegistry';

describe('RBAC Middleware & Route Registry (AUTH-009)', () => {
  describe('requireRole', () => {
    it('allows matching role and blocks mismatched role with 403', () => {
      const middleware = requireRole('ADMIN', 'MANAGER');
      let nextCalled = false;
      const next: NextFunction = (err?: any) => {
        if (!err) nextCalled = true;
      };

      // Allowed role: ADMIN
      const reqAdmin = { auth: { role: 'ADMIN' } } as unknown as Request;
      middleware(reqAdmin, {} as unknown as Response, next);
      expect(nextCalled).toBe(true);

      // Blocked role: STAFF
      const reqStaff = { auth: { role: 'STAFF' } } as unknown as Request;
      try {
        middleware(reqStaff, {} as unknown as Response, next);
        expect.unreachable('Should throw FORBIDDEN');
      } catch (err: any) {
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('FORBIDDEN');
      }

      // Unauthenticated
      const reqUnauth = {} as unknown as Request;
      try {
        middleware(reqUnauth, {} as unknown as Response, next);
        expect.unreachable('Should throw UNAUTHENTICATED');
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe('UNAUTHENTICATED');
      }
    });
  });

  describe('assertAllRoutesRegistered', () => {
    it('passes when all routes use route()', () => {
      const testApp = express();
      route(testApp as any, 'get', '/api/v1/registered-test', {
        roles: 'PUBLIC',
        handler: (_req: Request, res: Response) => res.send('ok'),
      });
      expect(() => assertAllRoutesRegistered(testApp)).not.toThrow();
    });

    it('throws when an unregistered rogue route is added directly to Express', () => {
      const testApp = express();
      testApp.get('/api/v1/rogue-route', (_req: Request, res: Response) => res.send('rogue'));
      expect(() => assertAllRoutesRegistered(testApp)).toThrow('Startup Assertion Failed');
    });
  });
});
