import supertest from 'supertest';
import { app } from '../../src/app';

export const makeAgent = (): ReturnType<typeof supertest.agent> => {
  return supertest.agent(app);
};

export const loginAs = async (
  agent: ReturnType<typeof supertest.agent>,
  role: 'ADMIN' | 'MANAGER' | 'STAFF' = 'STAFF'
): Promise<ReturnType<typeof supertest.agent>> => {
  // Stub for session-based auth until AUTH-004 is completed
  (agent as any)._testRole = role;
  return agent;
};

export const withCsrf = <T extends supertest.Test>(req: T): T => {
  return req.set('X-CSRF-Token', 'test-csrf-token');
};

export default { makeAgent, loginAs, withCsrf };
