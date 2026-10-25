import { describe, it, expect, afterAll } from 'vitest';
import { runInTransaction } from '../../src/shared/tx';
import { prisma, disconnect } from '../../src/config/prisma';
import { AUDIT_ACTIONS } from '../../src/modules/audit/actions';
import { AuditService, sanitizeAuditData } from '../../src/modules/audit/audit.service';

describe('INFRA-010: Transactional Audit Service', () => {
  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: { requestId: { startsWith: 'test-req-audit-' } },
    });
    await disconnect();
  });

  it('sanitizes and strips passwords, passwordHash, and tokens from audit payloads', () => {
    const raw = {
      password: 'plain_password',
      passwordHash: 'argon2_hashed_secret',
      token: 'jwt_bearer_token',
      secret: 'super_secret_value',
      authorization: 'Bearer token',
      cookie: 'connect.sid=123',
      csrfToken: 'csrf_secret',
      safeName: 'Project ServiceFlow',
      count: 42,
      id: BigInt(100),
      nested: { password: 'bad', valid: 'ok' },
    };

    const cleaned = sanitizeAuditData(raw);

    expect(cleaned.password).toBeUndefined();
    expect(cleaned.passwordHash).toBeUndefined();
    expect(cleaned.token).toBeUndefined();
    expect(cleaned.secret).toBeUndefined();
    expect(cleaned.authorization).toBeUndefined();
    expect(cleaned.cookie).toBeUndefined();
    expect(cleaned.csrfToken).toBeUndefined();
    expect(cleaned.safeName).toBe('Project ServiceFlow');
    expect(cleaned.count).toBe(42);
    expect(cleaned.id).toBe('100');
    expect(cleaned.nested.password).toBeUndefined();
    expect(cleaned.nested.valid).toBe('ok');
  });

  it('records an audit log row atomically within runInTransaction', async () => {
    const reqId = `test-req-audit-${Date.now()}`;

    await runInTransaction(async (tx) => {
      await AuditService.record(tx, {
        actor: { role: 'ADMIN' },
        action: AUDIT_ACTIONS.PROJECT_CREATED,
        entityType: 'Project',
        entityId: '501',
        after: { name: 'Apollo Project' },
        requestId: reqId,
        ip: '127.0.0.1',
      });
    });

    const found = await prisma.auditLog.findFirst({
      where: { requestId: reqId },
    });

    expect(found).not.toBeNull();
    expect(found?.action).toBe('PROJECT_CREATED');
    expect(found?.entityType).toBe('Project');
    expect(found?.entityId).toBe(BigInt(501));
    expect(found?.actorRole).toBe('ADMIN');
    expect(found?.afterJson).toEqual({ name: 'Apollo Project' });
    expect(found?.ipAddress).toBe('127.0.0.1');
  });

  it('rolls back audit log insert when outer transaction throws an error (atomic guarantee)', async () => {
    const rollbackReqId = `test-req-audit-rb-${Date.now()}`;

    await expect(
      runInTransaction(async (tx) => {
        await AuditService.record(tx, {
          action: AUDIT_ACTIONS.INVOICE_CREATED,
          entityType: 'Invoice',
          requestId: rollbackReqId,
        });
        throw new Error('SIMULATED_TRANSACTION_FAILURE');
      })
    ).rejects.toThrow('SIMULATED_TRANSACTION_FAILURE');

    const found = await prisma.auditLog.findFirst({
      where: { requestId: rollbackReqId },
    });

    expect(found).toBeNull();
  });
});
