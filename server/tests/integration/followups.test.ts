import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll } from '../helpers/factories';
import { getColomboToday } from '../../src/lib/date';
import prisma from '../../src/config/prisma';

describe('Follow-ups API Integration Tests (CRM-008, CRM-010)', () => {
  let staffAgent: any, staffUser: any, otherStaffAgent: any, otherStaffUser: any;

  beforeEach(async () => {
    await truncateAll();
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    staffUser = staffAgent.user;
    otherStaffAgent = await loginAs(makeAgent(), 'STAFF');
    otherStaffUser = otherStaffAgent.user;
  });

  it('GET /api/v1/follow-ups without token returns 401', async () => {
    const res = await request(app).get('/api/v1/follow-ups');
    expect(res.status).toBe(401);
  });

  it('POST creating a PENDING follow-up for yesterday returns 422', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const yesterday = new Date(getColomboToday().getTime() - 24 * 60 * 60 * 1000);
    const res = await withCsrf(staffAgent.post('/api/v1/follow-ups'), staffAgent)
      .send({ leadId: lead.id.toString(), scheduledAt: yesterday.toISOString() });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details?.[0]?.issue).toContain('cannot be scheduled before today');
  });

  it('POST creating a DONE follow-up for a past date is ALLOWED (returns 201)', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const past = new Date(getColomboToday().getTime() - 24 * 60 * 60 * 1000);
    const res = await withCsrf(staffAgent.post('/api/v1/follow-ups'), staffAgent)
      .send({ leadId: lead.id.toString(), scheduledAt: past.toISOString(), status: 'DONE' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'DONE', isOverdue: false });
  });

  it('POST creating a follow-up for future returns 201 with isOverdue: false', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const tomorrow = new Date(getColomboToday().getTime() + 24 * 60 * 60 * 1000);
    const res = await withCsrf(staffAgent.post('/api/v1/follow-ups'), staffAgent)
      .send({ leadId: lead.id.toString(), scheduledAt: tomorrow.toISOString(), notes: 'Call client' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: 'PENDING', isOverdue: false });
  });

  it('GET list computes and returns the isOverdue: true flag correctly', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const past = new Date(getColomboToday().getTime() - 48 * 60 * 60 * 1000);
    const future = new Date(getColomboToday().getTime() + 48 * 60 * 60 * 1000);

    await prisma.followUp.create({ data: { leadId: lead.id, follow_up_date: past, status: 'SCHEDULED', type: 'CALL', createdBy: staffUser.id } });
    await prisma.followUp.create({ data: { leadId: lead.id, follow_up_date: future, status: 'SCHEDULED', type: 'CALL', createdBy: staffUser.id } });
    await prisma.followUp.create({ data: { leadId: lead.id, follow_up_date: past, status: 'COMPLETED', type: 'CALL', createdBy: staffUser.id } });

    const res = await staffAgent.get('/api/v1/follow-ups');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);

    const overdue = res.body.data.find((f: any) => f.status === 'PENDING' && new Date(f.scheduledAt) < getColomboToday());
    const futureItem = res.body.data.find((f: any) => f.status === 'PENDING' && new Date(f.scheduledAt) > getColomboToday());
    const done = res.body.data.find((f: any) => f.status === 'DONE');
    expect(overdue?.isOverdue).toBe(true);
    expect(futureItem?.isOverdue).toBe(false);
    expect(done?.isOverdue).toBe(false);

    const overdueRes = await staffAgent.get('/api/v1/follow-ups?overdue=true');
    expect(overdueRes.status).toBe(200);
    expect(overdueRes.body.data).toHaveLength(1);
  });

  it('PATCH by a Staff user on another staff lead follow-up returns 403', async () => {
    const otherLead = await prisma.lead.create({ data: { ownerId: otherStaffUser.id, status: 'NEW' } });
    const tomorrow = new Date(getColomboToday().getTime() + 24 * 60 * 60 * 1000);
    const followUp = await prisma.followUp.create({
      data: { leadId: otherLead.id, follow_up_date: tomorrow, status: 'SCHEDULED', type: 'CALL', createdBy: otherStaffUser.id },
    });
    const res = await withCsrf(staffAgent.patch(`/api/v1/follow-ups/${followUp.id}`), staffAgent).send({ status: 'DONE' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('PATCH by lead owner successfully updates status to DONE', async () => {
    const lead = await prisma.lead.create({ data: { ownerId: staffUser.id, status: 'NEW' } });
    const tomorrow = new Date(getColomboToday().getTime() + 24 * 60 * 60 * 1000);
    const followUp = await prisma.followUp.create({
      data: { leadId: lead.id, follow_up_date: tomorrow, status: 'SCHEDULED', type: 'CALL', createdBy: staffUser.id },
    });
    const res = await withCsrf(staffAgent.patch(`/api/v1/follow-ups/${followUp.id}`), staffAgent).send({ status: 'DONE' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'DONE', isOverdue: false });
  });
});
