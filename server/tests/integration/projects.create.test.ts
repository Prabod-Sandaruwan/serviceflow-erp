import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

const CONCURRENCY_COUNT = process.env.CONCURRENCY_COUNT ? parseInt(process.env.CONCURRENCY_COUNT, 10) : 5;

describe('Project Creation API (PROJ-002)', () => {
  let managerAgent: any;
  let client: any;

  beforeEach(async () => {
    await truncateAll();
    managerAgent = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();
  });

  it('successfully creates a project from an ACCEPTED quotation', async () => {
    const quotation = await createQuotation({
      clientId: client.id, createdBy: managerAgent.user.id, status: 'ACCEPTED',
      title: 'ERP Overhaul', subtotal: 500000.0, total: 500000.0,
    });
    const res = await withCsrf(managerAgent.post('/api/v1/projects'), managerAgent).send({
      quotationId: quotation.id.toString(), name: 'Custom Project Name',
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      quotationId: quotation.id.toString(), clientId: client.id.toString(),
      name: 'Custom Project Name', status: 'PLANNED', budgetAmount: '500000',
    });
    expect(res.body.data.projectCode).toMatch(/^PRJ-\d{4}-\d{4}$/);
    expect(res.headers.location).toBe(`/api/v1/projects/${res.body.data.id}`);

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'PROJECT_CREATED', entityId: BigInt(res.body.data.id) },
    });
    expect(audit).not.toBeNull();
  });

  it('rejects creation from non-accepted quotation statuses with 409 QUOTATION_NOT_ACCEPTED', async () => {
    for (const status of ['DRAFT', 'APPROVED', 'REJECTED'] as const) {
      const q = await createQuotation({ clientId: client.id, createdBy: managerAgent.user.id, status });
      const res = await withCsrf(managerAgent.post('/api/v1/projects'), managerAgent).send({ quotationId: q.id.toString() });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('QUOTATION_NOT_ACCEPTED');
    }
    const pastDate = new Date('2020-01-01');
    const expiredQ = await createQuotation({
      clientId: client.id, createdBy: managerAgent.user.id, status: 'SENT',
      quotationDate: pastDate, validUntil: pastDate,
    });
    const expRes = await withCsrf(managerAgent.post('/api/v1/projects'), managerAgent).send({ quotationId: expiredQ.id.toString() });
    expect(expRes.status).toBe(409);
    expect(expRes.body.error.code).toBe('QUOTATION_NOT_ACCEPTED');
  });

  it('safely handles concurrent creation: invariant of exactly one project per quotation', async () => {
    const quotation = await createQuotation({ clientId: client.id, createdBy: managerAgent.user.id, status: 'ACCEPTED' });
    const requests = Array.from({ length: CONCURRENCY_COUNT }, () =>
      withCsrf(managerAgent.post('/api/v1/projects'), managerAgent).send({ quotationId: quotation.id.toString() })
    );
    const results = await Promise.all(requests);
    const successes = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(CONCURRENCY_COUNT - 1);
    expect(conflicts.every((r) => r.body.error?.code === 'PROJECT_ALREADY_EXISTS')).toBe(true);
    const count = await prisma.project.count({ where: { quotationId: quotation.id } });
    expect(count).toBe(1);
  });
});
