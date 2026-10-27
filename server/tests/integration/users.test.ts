import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Users API Edge Cases & Auditing (AUTH-016)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('GET /api/v1/users list must not contain passwordHash or password_hash in any user', async () => {
    const agent = makeAgent();
    await loginAs(agent, 'ADMIN');

    const res = await agent.get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    for (const u of res.body.data) {
      expect(u.passwordHash).toBeUndefined();
      expect(u.password_hash).toBeUndefined();
    }
  });

  it('creating a user and changing a role generates USER_CREATED and ROLE_CHANGED audit records', async () => {
    const agent = makeAgent();
    await loginAs(agent, 'ADMIN');

    const email = `audit-user-${Date.now()}@test.lk`;
    const createRes = await withCsrf(agent.post('/api/v1/users')).send({
      email,
      password: 'ValidPassword123!',
      role: 'STAFF',
      fullName: 'Audit User Target',
    });
    expect(createRes.status).toBe(201);
    const newUserId = BigInt(createRes.body.data.id);

    const createdAudit = await prisma.auditLog.findFirst({
      where: { entityId: newUserId, action: 'USER_CREATED' },
    });
    expect(createdAudit).not.toBeNull();

    const updateRes = await withCsrf(agent.patch(`/api/v1/users/${newUserId}`)).send({
      role: 'MANAGER',
    });
    expect(updateRes.status).toBe(200);

    const roleAudit = await prisma.auditLog.findFirst({
      where: { entityId: newUserId, action: 'ROLE_CHANGED' },
    });
    expect(roleAudit).not.toBeNull();
  });
});
