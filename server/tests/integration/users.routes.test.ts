import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';
import prisma from '../../src/config/prisma';

describe('Users API (AUTH-012)', () => {
  beforeEach(async () => {
    await truncateAll();
    await prisma.user.deleteMany({ where: { email: { contains: 'test.lk' } } });
  });

  const loginAs = async (agent: any, role: 'ADMIN' | 'STAFF') => {
    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const pwd = 'AdminPassword123!';
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

  it('ADMIN can create user, receives profile without hash', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'ADMIN');
    const email = `staff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.lk`;
    const res = await agent
      .post('/api/v1/users')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email, password: 'ValidPassword123!', role: 'STAFF', fullName: 'New Staff' });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.role).toBe('STAFF');
    expect(res.body.data.password_hash).toBeUndefined();
    expect(res.body.data.employee.full_name).toBe('New Staff');

    const listRes = await agent.get('/api/v1/users');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('duplicate email returns 409', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'ADMIN');
    const email = `dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.lk`;
    const payload = { email, password: 'ValidPassword123!', role: 'STAFF', fullName: 'Dup User' };
    const first = await agent.post('/api/v1/users').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send(payload);
    expect(first.status).toBe(201);

    const dupCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const second = await agent.post('/api/v1/users').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', dupCsrf).send(payload);
    expect(second.status).toBe(409);
  });

  it('weak password (< 12) returns 422', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'ADMIN');
    const res = await agent
      .post('/api/v1/users')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email: `short-${Date.now()}@test.lk`, password: 'short', role: 'STAFF', fullName: 'Short' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('STAFF calling POST /users gets 403', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'STAFF');
    const res = await agent
      .post('/api/v1/users')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email: `no-${Date.now()}@test.lk`, password: 'ValidPassword123!', role: 'STAFF', fullName: 'No' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
