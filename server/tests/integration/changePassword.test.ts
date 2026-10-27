import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent } from '../helpers/agent';
import { truncateAll, createUser } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('First-Login Guard & Change Password (AUTH-010)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  const setupUserAndLogin = async (agent: any, mustChangePassword = true) => {
    const csrfToken = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const currentPassword = 'OldPassword123!';
    const user = await createUser({
      passwordHash: await hashPassword(currentPassword),
      mustChangePassword,
    });

    await agent
      .post('/api/v1/auth/login')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrfToken)
      .send({ email: user.email, password: currentPassword });

    return { user, currentPassword, agent };
  };

  it('flagged user gets 403 on standard API routes', async () => {
    const agent = makeAgent();
    await setupUserAndLogin(agent, true);

    const res = await agent.get('/api/v1/test-protected');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PASSWORD_CHANGE_REQUIRED');
  });

  it('change-password rejects wrong current password with 422', async () => {
    const agent = makeAgent();
    await setupUserAndLogin(agent, true);

    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const res = await agent
      .post('/api/v1/auth/change-password')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ currentPassword: 'WrongPassword123!', newPassword: 'BrandNewPassword123!' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('change-password rejects same new password with 422', async () => {
    const agent = makeAgent();
    const { currentPassword } = await setupUserAndLogin(agent, true);

    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const res = await agent
      .post('/api/v1/auth/change-password')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ currentPassword, newPassword: currentPassword });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('successful change clears flag, returns 204, and allows access to standard routes', async () => {
    const agent = makeAgent();
    const { currentPassword } = await setupUserAndLogin(agent, true);

    const blockedRes = await agent.get('/api/v1/test-protected');
    expect(blockedRes.status).toBe(403);

    const csrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
    const changeRes = await agent
      .post('/api/v1/auth/change-password')
      .set('Origin', CLIENT_ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ currentPassword, newPassword: 'SuperSecretNewPassword123!' });

    expect(changeRes.status).toBe(204);

    const allowedRes = await agent.get('/api/v1/test-protected');
    expect(allowedRes.status).toBe(200);
    expect(allowedRes.body.status).toBe('ok');
  });
});
