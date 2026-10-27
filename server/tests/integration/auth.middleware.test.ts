import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import prisma from '../../src/config/prisma';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('Auth Middleware (AUTH-008)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupUserAndLogin = async (agent: any) => {
    const csrfToken = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const password = 'TestPassword123!';
    const user = await createUser({ passwordHash: await hashPassword(password) });
    await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrfToken)
      .send({ email: user.email, password });
    return user;
  };

  it('deactivating a user instantly blocks their next request (R-06)', async () => {
    const agent = makeAgent();
    const user = await setupUserAndLogin(agent);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);

    await prisma.user.update({
      where: { id: user.id },
      data: { is_active: false },
    });

    const blockedRes = await agent.get('/api/v1/auth/me');
    expect(blockedRes.status).toBe(401);
    expect(blockedRes.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('absolute session expiry (> 24 hours) returns 401', async () => {
    const agent = makeAgent();
    await setupUserAndLogin(agent);

    const initialRes = await agent.get('/api/v1/auth/me');
    expect(initialRes.status).toBe(200);

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);

    const expiredRes = await agent.get('/api/v1/auth/me');
    expect(expiredRes.status).toBe(401);
    expect(expiredRes.body.error.code).toBe('UNAUTHENTICATED');
  });
});
