import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Lead Conversion API Integration Tests (CRM-009)', () => {
  let adminAgent: any, staffAgent: any, adminUser: any;

  beforeEach(async () => {
    await truncateAll();
    adminAgent = await loginAs(makeAgent(), 'ADMIN');
    adminUser = adminAgent.user;
    staffAgent = await loginAs(makeAgent(), 'STAFF');
  });

  it('concurrency: simultaneous requests result in exactly one 2xx and one 409 with only 1 client created', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'QUALIFIED' } });

    const req1 = withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent).send({});
    const req2 = withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent).send({});

    const [res1, res2] = await Promise.all([req1, req2]);
    const statuses = [res1.status, res2.status].sort();

    expect(statuses).toEqual([200, 409]);
    const count = await prisma.client.count();
    expect(count).toBe(1);

    const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updated?.convertedClientId).not.toBeNull();
    expect(updated?.status).toBe('CONVERTED');
  });

  it('existing client: maps to existing client and does not create an extra client record', async () => {
    const existing = await createClient({ displayName: 'Pre-existing Acme Corp' });
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'PROPOSAL_SENT' } });

    const res = await withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent)
      .send({ existingClientId: existing.id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(existing.id.toString());

    const count = await prisma.client.count();
    expect(count).toBe(1);

    const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updated?.convertedClientId).toBe(existing.id);
  });

  it('already converted lead returns 409 LEAD_ALREADY_CONVERTED on subsequent convert', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'NEW' } });
    const first = await withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent).send({});
    expect(first.status).toBe(200);

    const second = await withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent).send({});
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('LEAD_ALREADY_CONVERTED');
  });

  it('non-existent existingClientId returns 404', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'NEW' } });
    const res = await withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent)
      .send({ existingClientId: '99999999' });
    expect(res.status).toBe(404);
  });

  it('staff cannot convert lead owned by another user (returns 403)', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'NEW' } });
    const res = await withCsrf(staffAgent.post(`/api/v1/leads/${lead.id}/convert`), staffAgent).send({});
    expect(res.status).toBe(403);
  });
});
