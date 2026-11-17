import { describe, expect, it } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
} from '../../src/modules/auth/password';

describe('Password module (AUTH-002)', () => {
  describe('hashPassword', () => {
    it('returns a hash string starting with $argon2id$', async () => {
      const hash = await hashPassword('ServiceFlow@2026');
      expect(hash).toMatch(/^\$argon2id\$/);
      expect(typeof hash).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const plain = 'CorrectPassword123!';
      const hash = await hashPassword(plain);
      const isValid = await verifyPassword(hash, plain);
      expect(isValid).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const hash = await hashPassword('CorrectPassword123!');
      const isValid = await verifyPassword(hash, 'WrongPassword456!');
      expect(isValid).toBe(false);
    });

    it('returns false for malformed hash without throwing', async () => {
      const isValid = await verifyPassword('not-a-valid-argon2-hash', 'anyPassword');
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordPolicy', () => {
    const validEmail = 'admin@serviceflow.lk';

    it('rejects passwords shorter than 12 characters', () => {
      const issues = validatePasswordPolicy('Short1!', validEmail);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.code === 'too_small')).toBe(true);
    });

    it('rejects passwords longer than 128 characters', () => {
      const tooLong = 'A'.repeat(129) + '1!a';
      const issues = validatePasswordPolicy(tooLong, validEmail);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.code === 'too_big')).toBe(true);
    });

    it('rejects passwords missing uppercase, lowercase, numbers, or symbols', () => {
      expect(validatePasswordPolicy('lowercase123456!', validEmail).length).toBeGreaterThan(0);
      expect(validatePasswordPolicy('UPPERCASE123456!', validEmail).length).toBeGreaterThan(0);
      expect(validatePasswordPolicy('NoDigitsHereAtAll!', validEmail).length).toBeGreaterThan(0);
      expect(validatePasswordPolicy('NoSymbols123456', validEmail).length).toBeGreaterThan(0);
    });

    it('rejects password matching email case-insensitively', () => {
      const issues = validatePasswordPolicy(validEmail.toUpperCase(), validEmail);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((i) => i.message.includes('email'))).toBe(true);
    });

    it('accepts a valid compliant password', () => {
      const issues = validatePasswordPolicy('ServiceFlow@2026', validEmail);
      expect(issues).toHaveLength(0);
    });
  });
});
