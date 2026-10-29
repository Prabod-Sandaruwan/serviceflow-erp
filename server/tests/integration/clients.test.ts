import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Clients API Integration Tests (CRM-004)', () => {
  let adminAgent: any, staffAgent: any, staffUser: any;

  beforeEach(async () => {
    await truncateAll();
    adminAgent = await loginAs(makeAgent(), 'ADMIN');
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    staffUser = staffAgent.user;
  });

  it('GET /api/v1/clients without a token returns 401', async () => {
    const res = await request(app).get('/api/v1/clients');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/clients returns paginated { data, meta }', async () => {
    await createClient({ displayName: 'Acme Corp', clientType: 'COMPANY' });
    await createClient({ displayName: 'John Doe', clientType: 'INDIVIDUAL' });

    const res = await adminAgent.get('/api/v1/clients?search=Acme');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].displayName).toBe('Acme Corp');
    expect(typeof res.body.data[0].id).toBe('string');
    expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
  });

  it('POST /api/v1/clients creates client and duplicate email returns 201 with duplicateWarning: true', async () => {
    const payload = { displayName: 'Apex Ltd', clientType: 'BUSINESS', email: 'dup@apex.lk' };
    const res1 = await withCsrf(adminAgent.post('/api/v1/clients'), adminAgent).send(payload);
    expect(res1.status).toBe(201);
    expect(res1.body.duplicateWarning).toBe(false);

    const res2 = await withCsrf(adminAgent.post('/api/v1/clients'), adminAgent)
      .send({ displayName: 'Apex Second', clientType: 'BUSINESS', email: 'dup@apex.lk' });
    expect(res2.status).toBe(201);
    expect(res2.body.duplicateWarning).toBe(true);
  });

  it('POST /api/v1/clients with invalid email format returns 422', async () => {
    const res = await withCsrf(adminAgent.post('/api/v1/clients'), adminAgent)
      .send({ displayName: 'Bad Email Ltd', clientType: 'INDIVIDUAL', email: 'invalid-email' });
    expect(res.status).toBe(422);
  });

  it('PATCH /api/v1/clients/:id as STAFF on unlinked client returns 403', async () => {
    const client = await createClient({ displayName: 'Other Client' });
    const res = await withCsrf(staffAgent.patch(`/api/v1/clients/${client.id}`), staffAgent)
      .send({ displayName: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/v1/clients/:id as STAFF attempting to change isActive field returns 403', async () => {
    const client = await createClient({ displayName: 'My Client' });
    await prisma.lead.create({ data: { ownerId: staffUser.id, convertedClientId: client.id, status: 'CONVERTED' } });
    const res = await withCsrf(staffAgent.patch(`/api/v1/clients/${client.id}`), staffAgent)
      .send({ isActive: false });
    expect(res.status).toBe(403);
  });

  it('PATCH /api/v1/clients/:id as ADMIN successfully updates isActive', async () => {
    const client = await createClient({ displayName: 'Active Client' });
    const res = await withCsrf(adminAgent.patch(`/api/v1/clients/${client.id}`), adminAgent)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});
