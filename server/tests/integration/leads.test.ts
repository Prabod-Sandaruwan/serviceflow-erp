import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Leads API Integration Tests (CRM-007)', () => {
  let adminAgent: any, staffAgent: any, staffUser: any, adminUser: any;

  beforeEach(async () => {
    await truncateAll();
    adminAgent = await loginAs(makeAgent(), 'ADMIN');
    adminUser = adminAgent.user;
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    staffUser = staffAgent.user;
  });

  it('GET /api/v1/leads without token returns 401', async () => {
    const res = await request(app).get('/api/v1/leads');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/leads as STAFF sets status NEW and owner_id to caller', async () => {
    const res = await withCsrf(staffAgent.post('/api/v1/leads'), staffAgent)
      .send({ expectedValue: 5000, notes: 'Initial enquiry' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('NEW');
    expect(res.body.data.ownerId).toBe(staffUser.id.toString());
    expect(res.body.data.expectedValue).toBe(5000);
  });

  it('POST /api/v1/leads as ADMIN can assign to another owner', async () => {
    const res = await withCsrf(adminAgent.post('/api/v1/leads'), adminAgent)
      .send({ ownerId: staffUser.id.toString(), expectedValue: 12000 });
    expect(res.status).toBe(201);
    expect(res.body.data.ownerId).toBe(staffUser.id.toString());
  });

  it('Staff list scoping: Staff only sees their own leads, others are hidden and 403 on get', async () => {
    const adminLead = await prisma.lead.create({ data: { ownerId: adminUser.id, status: 'NEW' } });
    await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });

    const listRes = await staffAgent.get('/api/v1/leads');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].ownerId).toBe(staffUser.id.toString());

    const getRes = await staffAgent.get(`/api/v1/leads/${adminLead.id}`);
    expect(getRes.status).toBe(403);
  });

  it('State rules: valid sequence NEW -> CONTACTED -> QUALIFIED -> PROPOSAL_SENT', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const patch1 = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ status: 'CONTACTED' });
    expect(patch1.status).toBe(200);
    const patch2 = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ status: 'QUALIFIED' });
    expect(patch2.status).toBe(200);
    const patch3 = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ status: 'PROPOSAL_SENT' });
    expect(patch3.status).toBe(200);
  });

  it('Invalid transition returns 409 INVALID_STATE_TRANSITION', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const res = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ status: 'PROPOSAL_SENT' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });

  it('WON or CONVERTED via PATCH returns 409 INVALID_STATE_TRANSITION', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'PROPOSAL_SENT' } });
    const res = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ status: 'WON' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });

  it('LOST requires lostReason: missing returns 422, provided returns 200', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const resFail = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ status: 'LOST' });
    expect(resFail.status).toBe(422);

    const resOk = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent)
      .send({ status: 'LOST', lostReason: 'Client budget cuts' });
    expect(resOk.status).toBe(200);
    expect(resOk.body.data.status).toBe('LOST');
    expect(resOk.body.data.lostReason).toBe('Client budget cuts');
  });

  it('Converted leads: modifying core fields returns 409', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'CONVERTED' } });
    const res = await withCsrf(staffAgent.patch(`/api/v1/leads/${lead.id}`), staffAgent).send({ expectedValue: 9999 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });
});
