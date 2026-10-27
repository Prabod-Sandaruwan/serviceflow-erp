import { describe, it, expect, beforeAll } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { registeredRoutes } from '../../src/shared/routeRegistry';

const allRoles = ['ADMIN', 'MANAGER', 'STAFF'] as const;
const agents: Record<string, any> = {};
let unauthAgent: any;

const apiRoutes = registeredRoutes.filter((r) => r.path.startsWith('/api/v1'));

const send = async (agent: any, route: any) => {
  const p = route.path.replace(/:[a-zA-Z0-9_]+/g, '999');
  const m = route.method.toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(m)) {
    const csrf = (await agent.get('/api/v1/auth/csrf')).body?.data?.csrfToken;
    agent.csrfToken = csrf;
    return withCsrf((agent as any)[m](p), agent).send({});
  }
  return (agent as any)[m](p);
};

beforeAll(async () => {
  await truncateAll();
  unauthAgent = makeAgent();
  for (const role of allRoles) {
    agents[role] = await loginAs(makeAgent(), role);
  }
});

if (apiRoutes.length === 0) {
  it('fails if registry is empty', () => expect.fail('Registry is empty'));
} else {
  describe.each(apiRoutes)('Route %s %s', (route) => {
    if (route.roles === 'PUBLIC') {
      it('allows unauthenticated access', async () => {
        const res = await send(unauthAgent, route);
        expect(res.status).not.toBe(401);
        expect(res.status).not.toBe(403);
      });
    } else {
      it('rejects unauthenticated caller with 401', async () => {
        const res = await send(unauthAgent, route);
        expect(res.status).toBe(401);
      });
      for (const role of allRoles) {
        if (!route.roles.includes(role)) {
          it(`rejects ${role} with 403`, async () => {
            const res = await send(agents[role], route);
            expect(res.status).toBe(403);
          });
        } else {
          it(`allows ${role} (not 401/403)`, async () => {
            const res = await send(agents[role], route);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
          });
        }
      }
    }
  });
}
