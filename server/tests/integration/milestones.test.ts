import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import { isInvoiceEligible } from '../../src/modules/milestones/milestones.service';
import prisma from '../../src/config/prisma';

describe('Milestone Invoice Eligibility (PROJ-008)', () => {
  let manager: any;
  let client: any;
  let project: any;
  let milestone: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 1',
      billingAmount: '25000',
    });
    milestone = mRes.body.data;
  });

  it('returns true when milestone is APPROVED and has no invoices', async () => {
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const eligible = await isInvoiceEligible(prisma, milestone.id);
    expect(eligible).toBe(true);

    const getRes = await manager.get(`/api/v1/milestones/${milestone.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.eligibleForInvoice).toBe(true);
  });

  it('returns false when milestone is not APPROVED (e.g. COMPLETED or PENDING)', async () => {
    expect(await isInvoiceEligible(prisma, milestone.id)).toBe(false);

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });

    expect(await isInvoiceEligible(prisma, milestone.id)).toBe(false);
    const getRes = await manager.get(`/api/v1/milestones/${milestone.id}`);
    expect(getRes.body.data.eligibleForInvoice).toBe(false);
  });

  it('returns false when milestone is APPROVED but a non-cancelled invoice exists', async () => {
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        projectId: BigInt(project.id),
        milestoneId: BigInt(milestone.id),
        status: 'DRAFT',
        subtotal: 25000,
        total: 25000,
        createdBy: manager.user.id,
      },
    });

    expect(await isInvoiceEligible(prisma, milestone.id)).toBe(false);

    // If the invoice is CANCELLED, milestone becomes eligible again
    await prisma.invoice.update({ where: { id: inv.id }, data: { status: 'CANCELLED' } });
    expect(await isInvoiceEligible(prisma, milestone.id)).toBe(true);
  });
});
