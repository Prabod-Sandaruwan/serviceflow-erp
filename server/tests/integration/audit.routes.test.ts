import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';
import prisma from '../../src/config/prisma';

describe('Audit Logs API (AUTH-015)', () => {
  beforeEach(async () => {
    await truncateAll();
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

  it('ADMIN can fetch logs (returns 200 and paginated list)', async () => {
    const agent = makeAgent();
    await loginAs(agent, 'ADMIN');

    const res = await agent.get('/api/v1/audit-logs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(20);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it('Non-ADMIN (MANAGER/STAFF) gets 403', async () => {
    const managerAgent = makeAgent();
    await loginAs(managerAgent, 'MANAGER');
    const managerRes = await managerAgent.get('/api/v1/audit-logs');
    expect(managerRes.status).toBe(403);

    const staffAgent = makeAgent();
    await loginAs(staffAgent, 'STAFF');
    const staffRes = await staffAgent.get('/api/v1/audit-logs');
    expect(staffRes.status).toBe(403);
  });

  it('Raw Prisma UPDATE on audit_logs throws error', async () => {
    await expect(
      prisma.$executeRawUnsafe('UPDATE audit_logs SET action="HACKED" LIMIT 1')
    ).rejects.toThrow();
  });
});
