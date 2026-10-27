import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';
import prisma from '../../src/config/prisma';

describe('Employees API (AUTH-014)', () => {
  beforeEach(async () => {
    await truncateAll();
    await prisma.user.deleteMany({ where: { email: { contains: 'emp-' } } });
  });

  const loginAs = async (agent: any, role: 'ADMIN' | 'MANAGER' | 'STAFF') => {
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

  it('ADMIN can create, update, and list employees', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'ADMIN');
    const email = `emp-${Date.now()}@test.lk`;
    const createRes = await agent
      .post('/api/v1/employees')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ fullName: 'Sarah Connor', email, jobTitle: 'Security Lead', phone: '+94770001111' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.email).toBe(email);
    expect(createRes.body.data.fullName || createRes.body.data.full_name).toBe('Sarah Connor');
    const empId = createRes.body.data.id;

    const updateRes = await agent
      .patch(`/api/v1/employees/${empId}`)
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ jobTitle: 'Director of Security' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.jobTitle || updateRes.body.data.job_title).toBe('Director of Security');

    const listRes = await agent.get('/api/v1/employees');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('MANAGER can list employees but gets 403 on create/update', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'MANAGER');
    const listRes = await agent.get('/api/v1/employees');
    expect(listRes.status).toBe(200);

    const createRes = await agent
      .post('/api/v1/employees')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ fullName: 'Forbidden Guy', email: `emp-${Date.now()}@test.lk`, jobTitle: 'Dev' });
    expect(createRes.status).toBe(403);

    const updateRes = await agent
      .patch('/api/v1/employees/1')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ jobTitle: 'New Title' });
    expect(updateRes.status).toBe(403);
  });

  it('STAFF gets 403 on all employee routes', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'STAFF');
    expect((await agent.get('/api/v1/employees')).status).toBe(403);
    const postRes = await agent.post('/api/v1/employees').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ fullName: 'No', email: `emp-${Date.now()}@test.lk`, jobTitle: 'Dev' });
    expect(postRes.status).toBe(403);
    const patchRes = await agent.patch('/api/v1/employees/1').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ jobTitle: 'No' });
    expect(patchRes.status).toBe(403);
  });

  it('duplicate email on create returns 409', async () => {
    const agent = makeAgent(), csrf = await loginAs(agent, 'ADMIN');
    const email = `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.lk`;
    const payload = { fullName: 'Duplicate User', email, jobTitle: 'Tester' };
    const first = await agent.post('/api/v1/employees').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send(payload);
    expect(first.status).toBe(201);
    const dupCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const second = await agent.post('/api/v1/employees').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', dupCsrf).send(payload);
    expect(second.status).toBe(409);
  });
});
