import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser, createClient } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('Clients Module (CRM-002)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  const loginAs = async (agent: any, role: 'ADMIN' | 'MANAGER' | 'STAFF' = 'STAFF') => {
    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const pwd = 'Password123!@#';
    const user = await createUser({
      passwordHash: await hashPassword(pwd),
      role,
      mustChangePassword: false,
    });
    await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email: user.email, password: pwd });
    return (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
  };

  it('GET /api/v1/clients returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/v1/clients');
    expect(res.status).toBe(401);
    expect(['UNAUTHORIZED', 'UNAUTHENTICATED']).toContain(res.body.error?.code);
  });

  it('returns paginated clients with BigInt IDs converted to string', async () => {
    const agent = makeAgent();
    await loginAs(agent, 'STAFF');

    await createClient({ displayName: 'Acme Corp', clientType: 'COMPANY' });
    await createClient({ displayName: 'John Doe', clientType: 'INDIVIDUAL' });

    const res = await agent.get('/api/v1/clients');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(typeof res.body.data[0].id).toBe('string');
    expect(res.body.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('filters clients by search term and client type', async () => {
    const agent = makeAgent();
    await loginAs(agent, 'MANAGER');

    await createClient({ displayName: 'Alpha Tech', clientType: 'COMPANY' });
    await createClient({ displayName: 'Beta Services', clientType: 'COMPANY' });
    await createClient({ displayName: 'Alpha User', clientType: 'INDIVIDUAL' });

    const searchRes = await agent.get('/api/v1/clients?search=Alpha');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBe(2);

    const typeRes = await agent.get('/api/v1/clients?type=INDIVIDUAL');
    expect(typeRes.status).toBe(200);
    expect(typeRes.body.data.length).toBe(1);
    expect(typeRes.body.data[0].displayName).toBe('Alpha User');
  });
});

