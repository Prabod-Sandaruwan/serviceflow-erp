import supertest from 'supertest';
import { app } from '../../src/app';
import { createUser } from './factories';
import { hashPassword } from '../../src/modules/auth/password';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

export const makeAgent = (): ReturnType<typeof supertest.agent> => {
  const agent = supertest.agent(app);
  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
  for (const m of methods) {
    const orig = (agent as any)[m].bind(agent);
    (agent as any)[m] = (...args: any[]) => {
      const req = orig(...args);
      req._supertestAgent = agent;
      return req;
    };
  }
  return agent;
};

export const loginAs = async (
  agent: ReturnType<typeof supertest.agent>,
  role: 'ADMIN' | 'MANAGER' | 'STAFF' = 'STAFF'
): Promise<ReturnType<typeof supertest.agent>> => {
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
  const freshCsrf = (await agent.get('/api/v1/auth/csrf')).body.data.csrfToken;
  (agent as any).csrfToken = freshCsrf;
  (agent as any).user = user;
  return agent;
};

export const withCsrf = <T extends supertest.Test>(req: T, tokenOrAgent?: any): T => {
  const agent = (req as any)._supertestAgent || tokenOrAgent;
  const token =
    typeof tokenOrAgent === 'string'
      ? tokenOrAgent
      : agent?.csrfToken || 'test-csrf-token';
  return req.set('Origin', CLIENT_ORIGIN).set('X-CSRF-Token', token);
};

export default { makeAgent, loginAs, withCsrf };
