import { describe, expect, it } from 'vitest';
import { loginSchema } from '../../src/modules/auth/auth.schemas';

describe('Auth Schemas (AUTH-005)', () => {
  it('validates and normalizes valid login input', () => {
    const input = {
      body: {
        email: '  Admin@ServiceFlow.LK  ',
        password: 'Password123!',
      },
    };
    const parsed = loginSchema.parse(input);
    expect(parsed.body.email).toBe('admin@serviceflow.lk');
    expect(parsed.body.password).toBe('Password123!');
  });

  it('rejects invalid email address', () => {
    const result = loginSchema.safeParse({
      body: { email: 'not-an-email', password: 'Password123!' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      body: { email: 'admin@serviceflow.lk', password: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects unrecognized properties due to strict mode', () => {
    const result = loginSchema.safeParse({
      body: {
        email: 'admin@serviceflow.lk',
        password: 'Password123!',
        extra: 'field',
      },
    });
    expect(result.success).toBe(false);
  });
});
