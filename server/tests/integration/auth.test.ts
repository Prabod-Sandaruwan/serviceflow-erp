import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import prisma from '../../src/config/prisma';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('Authentication Edge Cases (AUTH-016)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  const getSid = (res: any) => {
    const cookies = res.headers['set-cookie'] || [];
    const sidCookie = cookies.find((c: string) => c.startsWith('sf.sid='));
    return sidCookie?.split(';')[0]?.replace('sf.sid=', '');
  };

  it('session regeneration produces a new sf.sid cookie upon login', async () => {
    const agent = makeAgent(), csrfRes = await agent.get('/api/v1/auth/csrf');
    const sidBefore = getSid(csrfRes), pwd = 'Password123!@#';
    const user = await createUser({ passwordHash: await hashPassword(pwd), mustChangePassword: false });

    const loginRes = await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrfRes.body.data.csrfToken)
      .send({ email: user.email, password: pwd });

    expect(loginRes.status).toBe(200);
    const sidAfter = getSid(loginRes);
    expect(sidBefore).toBeDefined();
    expect(sidAfter).toBeDefined();
    expect(sidBefore).not.toBe(sidAfter);
  });

  it('idle expiry in MySQL sessions table forces 401 on next request', async () => {
    const agent = makeAgent();
    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken, pwd = 'Password123!@#';
    const user = await createUser({ passwordHash: await hashPassword(pwd), mustChangePassword: false });

    await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email: user.email, password: pwd });

    expect((await agent.get('/api/v1/auth/me')).status).toBe(200);
    const past = Math.floor(Date.now() / 1000) - 10;
    await prisma.$executeRawUnsafe('UPDATE sessions SET expires = ?', past);
    expect((await agent.get('/api/v1/auth/me')).status).toBe(401);
  });

  it('successful login and logout generate LOGIN and LOGOUT audit records', async () => {
    const agent = makeAgent();
    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken, pwd = 'Password123!@#';
    const user = await createUser({ passwordHash: await hashPassword(pwd), mustChangePassword: false });

    await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ email: user.email, password: pwd });

    const logoutCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const logoutRes = await agent
      .post('/api/v1/auth/logout')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', logoutCsrf);
    expect(logoutRes.status).toBe(204);

    const logs = await prisma.auditLog.findMany({
      where: { actorUserId: user.id },
      orderBy: { createdAt: 'asc' },
    });
    const actions = logs.map((l: any) => l.action);
    expect(actions).toContain('LOGIN');
    expect(actions).toContain('LOGOUT');
  });
});
