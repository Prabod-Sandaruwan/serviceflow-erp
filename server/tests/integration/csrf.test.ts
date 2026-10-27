import { describe, expect, it } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('CSRF Protection & GET /api/v1/auth/csrf (AUTH-004)', () => {
  it('GET /api/v1/auth/csrf returns token and sets session cookie', async () => {
    const agent = makeAgent();
    const res = await agent.get('/api/v1/auth/csrf');

    expect(res.status).toBe(200);
    expect(res.body.data.csrfToken).toBeDefined();
    expect(typeof res.body.data.csrfToken).toBe('string');
    expect(res.body.data.csrfToken).toHaveLength(64);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies?.some((c: string) => c.startsWith('sf.sid='))).toBe(true);
  });

  it('POST /api/v1/test-mutation without token returns 403 CSRF_INVALID', async () => {
    const agent = makeAgent();
    await agent.get('/api/v1/auth/csrf');

    const res = await agent
      .post('/api/v1/test-mutation')
      .set('Origin', CLIENT_ORIGIN);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_INVALID');
    expect(res.body.error.message).toBe('Invalid CSRF token');
  });

  it('POST /api/v1/test-mutation with wrong token returns 403 CSRF_INVALID', async () => {
    const agent = makeAgent();
    await agent.get('/api/v1/auth/csrf');

    const res = await agent
      .post('/api/v1/test-mutation')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', 'wrong-token-value-that-does-not-match');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_INVALID');
  });

  it('POST /api/v1/test-mutation with correct token but wrong Origin returns 403', async () => {
    const agent = makeAgent();
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const token = csrfRes.body.data.csrfToken;

    const res = await agent
      .post('/api/v1/test-mutation')
      .set('Origin', 'http://malicious-attacker.com')
      .set('X-CSRF-Token', token);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_INVALID');
    expect(res.body.error.message).toBe('Invalid Origin');
  });

  it('POST /api/v1/test-mutation with correct token and valid Origin returns 200', async () => {
    const agent = makeAgent();
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const token = csrfRes.body.data.csrfToken;

    const res = await agent
      .post('/api/v1/test-mutation')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
