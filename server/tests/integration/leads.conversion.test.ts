import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient } from '../helpers/factories';
import prisma from '../../src/config/prisma';

const CONCURRENCY_COUNT = process.env.CONCURRENCY_COUNT ? parseInt(process.env.CONCURRENCY_COUNT, 10) : 5;

describe('Lead Conversion API Integration Tests (CRM-009, CRM-010)', () => {
  let adminAgent: any, staffAgent: any, adminUser: any;

  beforeEach(async () => {
    await truncateAll();
    adminAgent = await loginAs(makeAgent(), 'ADMIN');
    adminUser = adminAgent.user;
    staffAgent = await loginAs(makeAgent(), 'STAFF');
  });

  it('concurrency: simultaneous requests result in exactly one 2xx and others 409 with only 1 client created', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'QUALIFIED' } });
    const requests = Array.from({ length: CONCURRENCY_COUNT }, () =>
      withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent).send({})
    );
    const results = await Promise.all(requests);
    const successes = results.filter((r) => r.status === 200 || r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(CONCURRENCY_COUNT - 1);
    expect(await prisma.client.count()).toBe(1);

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
    expect(await prisma.client.count()).toBe(1);

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

  it('converting a lead records LEAD_CONVERTED in audit logs', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'QUALIFIED' } });
    const res = await withCsrf(adminAgent.post(`/api/v1/leads/${lead.id}/convert`), adminAgent).send({});
    expect(res.status).toBe(200);
    const log = await prisma.auditLog.findFirst({ where: { entityId: lead.id, action: 'LEAD_CONVERTED' } });
    expect(log).not.toBeNull();
    expect(log?.actorUserId).toBe(adminUser.id);
  });
});
