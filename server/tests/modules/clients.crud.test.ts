import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../src/app';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser, createClient } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';
import prisma from '../../src/config/prisma';

describe('Client CRUD and Staff Limits (CRM-003)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  const loginAs = async (agent: any, role: 'ADMIN' | 'MANAGER' | 'STAFF' = 'STAFF') => {
    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const pwd = 'Password123!@#';
    const user = await createUser({ passwordHash: await hashPassword(pwd), role, mustChangePassword: false });
    await agent.post('/api/v1/auth/login').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf)
      .send({ email: user.email, password: pwd });
    const newCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    return { csrf: newCsrf, user };
  };

  it('creates client with audit, and warns on duplicate email without blocking', async () => {
    const agent = makeAgent();
    const { csrf } = await loginAs(agent, 'MANAGER');
    const payload = { displayName: 'Apex Ltd', clientType: 'BUSINESS', email: 'info@apex.lk', registrationNumber: 'PV12345' };

    const res1 = await agent.post('/api/v1/clients').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send(payload);
    expect(res1.status).toBe(201);
    expect(typeof res1.body.data.id).toBe('string');
    expect(res1.body.duplicateWarning).toBe(false);

    const res2 = await agent.post('/api/v1/clients').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf)
      .send({ displayName: 'Apex Branch', clientType: 'BUSINESS', email: 'info@apex.lk' });
    expect(res2.status).toBe(201);
    expect(res2.body.duplicateWarning).toBe(true);

    const audit = await prisma.auditLog.findFirst({ where: { action: 'CLIENT_CREATED' } });
    expect(audit).toBeDefined();
  });

  it('validates invalid email with 422', async () => {
    const agent = makeAgent();
    const { csrf } = await loginAs(agent, 'ADMIN');
    const res = await agent.post('/api/v1/clients').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf)
      .send({ displayName: 'Test', clientType: 'INDIVIDUAL', email: 'invalid-email' });
    expect(res.status).toBe(422);
  });

  it('enforces Staff limits: 403 on unlinked client, 403 on isActive, 200 on own lead client', async () => {
    const staffAgent = makeAgent();
    const { csrf: staffCsrf, user: staffUser } = await loginAs(staffAgent, 'STAFF');

    const unlinked = await createClient({ displayName: 'Unlinked Client' });

    const patchUnlinked = await staffAgent.patch(`/api/v1/clients/${unlinked.id}`)
      .set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', staffCsrf).send({ displayName: 'Hacked' });
    expect(patchUnlinked.status).toBe(403);

    const ownClient = await createClient({ displayName: 'Own Client' });
    await prisma.lead.create({
      data: { ownerId: staffUser.id, convertedClientId: ownClient.id, status: 'CONVERTED' },
    });

    const patchActive = await staffAgent.patch(`/api/v1/clients/${ownClient.id}`)
      .set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', staffCsrf).send({ isActive: false });
    expect(patchActive.status).toBe(403);

    const patchOwn = await staffAgent.patch(`/api/v1/clients/${ownClient.id}`)
      .set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', staffCsrf).send({ displayName: 'Updated Own Client' });
    expect(patchOwn.status).toBe(200);
    expect(patchOwn.body.data.displayName).toBe('Updated Own Client');
  });

  it('guarantees NO DELETE endpoint exists (FR-CRM-001 acceptance)', async () => {
    const agent = makeAgent();
    const { csrf } = await loginAs(agent, 'ADMIN');
    const client = await createClient({ displayName: 'Safe Client' });
    const delRes = await agent.delete(`/api/v1/clients/${client.id}`).set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf);
    expect(delRes.status).toBe(404);
  });
});

