import { describe, it, expect, beforeAll } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll } from '../helpers/factories';
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

describe('Authorization Matrix Sanity Checks', () => {
  it('includes CRM, quotation, project, milestone and task routes in registered matrix', () => {
    const paths = apiRoutes.map((r) => `${r.method.toUpperCase()} ${r.path}`);
    const expected = [
      'GET /api/v1/clients', 'POST /api/v1/clients', 'GET /api/v1/clients/:id', 'PATCH /api/v1/clients/:id',
      'GET /api/v1/leads', 'POST /api/v1/leads', 'GET /api/v1/leads/:id', 'PATCH /api/v1/leads/:id',
      'POST /api/v1/leads/:id/convert', 'GET /api/v1/follow-ups', 'POST /api/v1/follow-ups', 'PATCH /api/v1/follow-ups/:id',
      'GET /api/v1/quotations', 'POST /api/v1/quotations', 'GET /api/v1/quotations/:id', 'GET /api/v1/quotations/:id/pdf',
      'PATCH /api/v1/quotations/:id', 'POST /api/v1/quotations/:id/submit', 'POST /api/v1/quotations/:id/approve',
      'POST /api/v1/quotations/:id/reject', 'POST /api/v1/quotations/:id/send', 'POST /api/v1/quotations/:id/respond',
      'GET /api/v1/projects', 'POST /api/v1/projects', 'GET /api/v1/projects/:id', 'PATCH /api/v1/projects/:id',
      'GET /api/v1/projects/:id/milestones', 'POST /api/v1/projects/:id/milestones',
      'GET /api/v1/milestones/:id', 'PATCH /api/v1/milestones/:id', 'POST /api/v1/milestones/:id/approve',
      'GET /api/v1/tasks', 'GET /api/v1/projects/:id/tasks', 'POST /api/v1/projects/:id/tasks', 'PATCH /api/v1/tasks/:id',
      'GET /api/v1/invoices', 'POST /api/v1/invoices', 'GET /api/v1/invoices/:id', 'GET /api/v1/invoices/:id/pdf', 'PATCH /api/v1/invoices/:id',
      'POST /api/v1/invoices/:id/issue', 'POST /api/v1/invoices/:id/cancel', 'POST /api/v1/invoices/:id/payments',
      'GET /api/v1/invoices/:id/payments',
    ];
    for (const p of expected) expect(paths).toContain(p);
  });
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
