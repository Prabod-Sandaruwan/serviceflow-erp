import { describe, it, expect, beforeAll } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import { roleMatrix, type Role, type RoleMatrixItem } from './role-matrix.data';

async function execReq(agent: any, item: RoleMatrixItem) {
  const method = item.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
  const req = (agent[method] as (url: string) => any)(item.url);
  const authed = method === 'get' ? req : withCsrf(req, agent);
  return item.payload ? authed.send(item.payload) : authed;
}

describe('Role Permissions Integration Tests', () => {
  let admin: any, mgr: any, mgr2: any, staff: any, otherStaff: any;

  beforeAll(async () => {
    await truncateAll();
    admin = await loginAs(makeAgent(), 'ADMIN');
    mgr = await loginAs(makeAgent(), 'MANAGER');
    mgr2 = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    otherStaff = await loginAs(makeAgent(), 'STAFF');
  });

  const getAgent = (role: Role) => (role === 'ADMIN' ? admin : role === 'MANAGER' ? mgr : staff);

  describe('Block 1: Table-Driven Matrix', () => {
    for (const item of roleMatrix) {
      for (const role of item.allowedRoles) {
        it(`${item.name} (${item.method}) - ${role} allowed (not 403)`, async () => {
          const res = await execReq(getAgent(role), item);
          expect(res.status).not.toBe(403);
        });
      }
      for (const role of item.forbiddenRoles) {
        it(`${item.name} (${item.method}) - ${role} forbidden (403)`, async () => {
          const res = await execReq(getAgent(role), item);
          expect(res.status).toBe(403);
        });
      }
    }
  });

  describe('Block 2: Staff Ownership Scoping', () => {
    it('staff can edit own lead, but receives 403 on another staff lead', async () => {
      const createRes = await withCsrf(staff.post('/api/v1/leads'), staff).send({ expectedValue: 50000 });
      expect(createRes.status).toBe(201);
      const leadId = createRes.body.data.id;

      const editOther = await withCsrf(otherStaff.patch(`/api/v1/leads/${leadId}`), otherStaff).send({ expectedValue: 60000 });
      expect(editOther.status).toBe(403);

      const editOwn = await withCsrf(staff.patch(`/api/v1/leads/${leadId}`), staff).send({ expectedValue: 70000 });
      expect(editOwn.status).toBe(200);
      expect(editOwn.body.data.expectedValue).toBe(70000);
    });
  });

  describe('Block 3: Quotation Approval & Self-Approval Guard', () => {
    it('creator manager cannot approve own quotation (403), other manager can (200)', async () => {
      const client = await createClient({ is_active: true });
      const q = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: mgr.user.id });

      const selfRes = await withCsrf(mgr.post(`/api/v1/quotations/${q.id}/approve`), mgr);
      expect(selfRes.status).toBe(403);
      expect(selfRes.body.error.code).toBe('SELF_APPROVAL_FORBIDDEN');

      const otherMgrRes = await withCsrf(mgr2.post(`/api/v1/quotations/${q.id}/approve`), mgr2);
      expect(otherMgrRes.status).not.toBe(403);
      expect(otherMgrRes.status).toBe(200);
      expect(otherMgrRes.body.data.status).toBe('APPROVED');
    });
  });
});
