import { describe, expect, it, beforeEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { createUser, truncateAll } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('Auth Routes (AUTH-006)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  const setupUserAndLogin = async (agent: any) => {
    const csrfToken = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const password = 'ValidPassword123!';
    const user = await createUser({ passwordHash: await hashPassword(password) });
    const res = await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrfToken)
      .send({ email: user.email, password });
    return { user, csrfToken, res };
  };

  it('login works with valid credentials, sets cookie, updates csrfToken', async () => {
    const agent = makeAgent();
    const { user, csrfToken, res } = await setupUserAndLogin(agent);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
    expect(res.headers['set-cookie']?.some((c: string) => c.startsWith('sf.sid='))).toBe(true);

    const postLoginCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    expect(postLoginCsrf).not.toBe(csrfToken);
  });

  it('login fails without CSRF token (403)', async () => {
    const agent = makeAgent();
    await agent.get('/api/v1/auth/csrf');

    const res = await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .send({ email: 'admin@serviceflow.lk', password: 'Password123!' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_INVALID');
  });

  it('GET /me returns profile after login', async () => {
    const agent = makeAgent();
    const { user } = await setupUserAndLogin(agent);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(user.email);
    expect(meRes.body.data.password_hash).toBeUndefined();
  });

  it('POST /logout clears cookie and returns 204', async () => {
    const agent = makeAgent();
    await setupUserAndLogin(agent);

    const newCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const logoutRes = await agent
      .post('/api/v1/auth/logout')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', newCsrf);

    expect(logoutRes.status).toBe(204);
  });

  it('GET /me returns 401 after logout', async () => {
    const agent = makeAgent();
    await setupUserAndLogin(agent);

    const newCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    await agent.post('/api/v1/auth/logout').set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', newCsrf);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(401);
    expect(meRes.body.error.code).toBe('UNAUTHENTICATED');
  });
});
