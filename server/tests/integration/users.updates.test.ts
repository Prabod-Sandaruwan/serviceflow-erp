import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';
import prisma from '../../src/config/prisma';
import { UserRepository } from '../../src/modules/users/users.repository';

describe('User updates, role changes, deactivation & password reset (AUTH-013)', () => {
  beforeEach(async () => {
    await truncateAll();
    await prisma.user.deleteMany({ where: { email: { contains: 'test.com' } } });
  });

  const loginAsAdmin = async (agent: any) => {
    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const user = await createUser({
      passwordHash: await hashPassword('AdminPass123!@#'),
      role: 'ADMIN',
      mustChangePassword: false,
    });
    await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email: user.email, password: 'AdminPass123!@#' });
    return { user, csrf: (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken };
  };

  it('self-modification of role or isActive returns 409', async () => {
    const agent = makeAgent(), { user, csrf } = await loginAsAdmin(agent);
    const r1 = await agent.patch(`/api/v1/users/${user.id}`).set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ role: 'STAFF' });
    expect(r1.status).toBe(409);
    expect(r1.body.error.code).toBe('SELF_MODIFICATION_FORBIDDEN');

    const r2 = await agent.patch(`/api/v1/users/${user.id}`).set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ isActive: false });
    expect(r2.status).toBe(409);
    expect(r2.body.error.code).toBe('SELF_MODIFICATION_FORBIDDEN');
  });

  it('demoting or deactivating last ADMIN returns 409', async () => {
    const agent = makeAgent(), { csrf } = await loginAsAdmin(agent);
    const target = await createUser({ role: 'ADMIN', is_active: true });
    const spy = vi.spyOn(UserRepository, 'countActiveAdmins').mockResolvedValue(1);
    const res = await agent.patch(`/api/v1/users/${target.id}`).set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ role: 'STAFF' });
    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('last active ADMIN');
    spy.mockRestore();
  });

  it('valid update changes role, audits, and purges sessions', async () => {
    const agent = makeAgent(), { csrf } = await loginAsAdmin(agent);
    const target = await createUser({ role: 'STAFF' });
    const future = Math.floor(Date.now() / 1000) + 3600;
    await prisma.$executeRawUnsafe(
      'INSERT INTO sessions (session_id, expires, data) VALUES ("test-sess-u13", ?, ?)',
      future, `{"cookie":{},"userId":"${target.id}","role":"STAFF"}`
    );
    const res = await agent.patch(`/api/v1/users/${target.id}`).set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ role: 'MANAGER' });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('MANAGER');
    expect(await prisma.auditLog.count({ where: { entityId: target.id, action: 'ROLE_CHANGED' } })).toBe(1);
    const remaining: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id = "test-sess-u13"');
    expect(remaining.length).toBe(0);
  });

  it('reset password sets must_change_password and returns 204', async () => {
    const agent = makeAgent(), { csrf } = await loginAsAdmin(agent);
    const target = await createUser({ role: 'STAFF', mustChangePassword: false });
    const res = await agent.post(`/api/v1/users/${target.id}/reset-password`).set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', csrf).send({ tempPassword: 'TemporaryPass123!' });
    expect(res.status).toBe(204);
    const updated = await prisma.user.findUnique({ where: { id: target.id } });
    expect(updated?.must_change_password).toBe(true);
    expect(await prisma.auditLog.count({ where: { entityId: target.id, action: 'PASSWORD_RESET' } })).toBe(1);
  });
});
