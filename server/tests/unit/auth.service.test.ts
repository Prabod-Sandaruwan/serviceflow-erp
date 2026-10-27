import { describe, expect, it, beforeEach } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service';
import { createUser, truncateAll } from '../helpers/factories';
import { hashPassword } from '../../src/modules/auth/password';
import { AppError } from '../../src/shared/errors';
import prisma from '../../src/config/prisma';

describe('AuthService.login (AUTH-005)', () => {
  beforeEach(async () => {
    await truncateAll();
  });

  it('fails with INVALID_CREDENTIALS for unknown email', async () => {
    try {
      await AuthService.login({ email: 'nonexistent@serviceflow.lk', password: 'SecretPassword123!' });
      expect.fail('Should have thrown AppError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('fails with identical INVALID_CREDENTIALS for wrong password', async () => {
    const passwordHash = await hashPassword('CorrectPassword123!');
    const user = await createUser({ passwordHash });

    try {
      await AuthService.login({ email: user.email, password: 'WrongPassword456!' });
      expect.fail('Should have thrown AppError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('fails with identical INVALID_CREDENTIALS for deactivated user', async () => {
    const passwordHash = await hashPassword('CorrectPassword123!');
    const user = await createUser({ passwordHash, isActive: false });

    try {
      await AuthService.login({ email: user.email, password: 'CorrectPassword123!' });
      expect.fail('Should have thrown AppError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('succeeds, returns profile without passwordHash, and updates audit/lastLogin', async () => {
    const plainPassword = 'CorrectPassword123!';
    const passwordHash = await hashPassword(plainPassword);
    const user = await createUser({ passwordHash });

    const result = await AuthService.login(
      { email: user.email, password: plainPassword },
      '127.0.0.1',
      'req-login-123'
    );

    expect(result).toBeDefined();
    expect(result.id).toBe(user.id.toString());
    expect(result.email).toBe(user.email);
    expect(result.password_hash).toBeUndefined();
    expect((result as any).passwordHash).toBeUndefined();

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.last_login_at).toBeDefined();
    expect(updatedUser?.last_login_at).not.toBeNull();

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: 'USER', entityId: user.id },
    });
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].action).toBe('LOGIN');
    expect(auditLogs[0].ipAddress).toBe('127.0.0.1');
    expect(auditLogs[0].requestId).toBe('req-login-123');
  });
});
