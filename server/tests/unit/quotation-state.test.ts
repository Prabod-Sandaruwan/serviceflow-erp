import { describe, it, expect } from 'vitest';
import { assertTransition, quotationMachine, Role } from '../../src/shared/state';
import { ConflictError } from '../../src/shared/errors';

describe('Quotation State Machine Transitions (QUOT-010)', () => {
  const validCases: Array<{ from: string; to: string; role?: Role }> = [
    { from: 'DRAFT', to: 'PENDING_APPROVAL' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED', role: 'MANAGER' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED', role: 'ADMIN' },
    { from: 'PENDING_APPROVAL', to: 'REJECTED', role: 'MANAGER' },
    { from: 'PENDING_APPROVAL', to: 'REJECTED', role: 'ADMIN' },
    { from: 'REJECTED', to: 'DRAFT' },
    { from: 'APPROVED', to: 'SENT' },
    { from: 'SENT', to: 'ACCEPTED' },
    { from: 'SENT', to: 'DECLINED' },
  ];

  it.each(validCases)(
    'allows valid transition: $from -> $to (role: $role)',
    ({ from, to, role }) => {
      expect(() =>
        assertTransition(quotationMachine as any, from as any, to as any, role)
      ).not.toThrow();
    }
  );

  const invalidCases: Array<{ from: string; to: string; role?: Role; desc: string }> = [
    { from: 'DRAFT', to: 'APPROVED', desc: 'skip review' },
    { from: 'SENT', to: 'DRAFT', desc: 'sent to draft' },
    { from: 'DRAFT', to: 'SENT', desc: 'skip approval' },
    { from: 'PENDING_APPROVAL', to: 'APPROVED', role: 'STAFF', desc: 'unauthorized role' },
    { from: 'ACCEPTED', to: 'DRAFT', desc: 'accepted to draft' },
    { from: 'DECLINED', to: 'ACCEPTED', desc: 'declined to accepted' },
  ];

  it.each(invalidCases)(
    'rejects invalid transition: $from -> $to ($desc) with 409 INVALID_STATE_TRANSITION',
    ({ from, to, role }) => {
      try {
        assertTransition(quotationMachine as any, from as any, to as any, role);
        expect.unreachable('Should have thrown ConflictError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ConflictError);
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('INVALID_STATE_TRANSITION');
      }
    }
  );
});

