import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll } from '../helpers/factories';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('Login Rate Limiter (AUTH-007)', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await truncateAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks the 6th failed login attempt with 429 RATE_LIMITED, and allows login after 15 minutes', async () => {
    const agent = makeAgent();
    const csrfRes = await agent.get('/api/v1/auth/csrf');
    const csrfToken = csrfRes.body.data.csrfToken;

    const payload = { email: 'ratelimit@serviceflow.lk', password: 'WrongPassword123!' };

    // 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      const res = await agent
        .post('/api/v1/auth/login')
        .set('Origin', CLIENT_ORIGIN)
        .set('X-CSRF-Token', csrfToken)
        .send(payload);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    }

    // 6th attempt should be blocked
    const blockedRes = await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrfToken)
      .send(payload);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.error.code).toBe('RATE_LIMITED');

    // Advance timers by 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000);

    // 7th attempt should reset and return 401 again
    const resetRes = await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrfToken)
      .send(payload);
    expect(resetRes.status).toBe(401);
    expect(resetRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
