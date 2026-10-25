import { describe, it, expect } from 'vitest';
import { ConflictError } from '../../src/shared/errors';
import {
  assertTransition,
  quotationMachine,
  projectMachine,
  milestoneMachine,
  taskMachine,
  invoiceMachine,
  paymentMachine,
  expenseMachine,
} from '../../src/shared/state';

describe('INFRA-007: State Machine Helpers', () => {
  const validTransitions = [
    { m: quotationMachine, from: 'DRAFT', to: 'PENDING_APPROVAL' },
    { m: quotationMachine, from: 'PENDING_APPROVAL', to: 'APPROVED', role: 'ADMIN' as const },
    { m: quotationMachine, from: 'PENDING_APPROVAL', to: 'REJECTED', role: 'MANAGER' as const },
    { m: quotationMachine, from: 'REJECTED', to: 'DRAFT' },
    { m: quotationMachine, from: 'APPROVED', to: 'SENT' },
    { m: quotationMachine, from: 'SENT', to: 'ACCEPTED' },
    { m: quotationMachine, from: 'SENT', to: 'DECLINED' },
    { m: projectMachine, from: 'PLANNED', to: 'ACTIVE' },
    { m: projectMachine, from: 'PLANNED', to: 'CANCELLED' },
    { m: projectMachine, from: 'ACTIVE', to: 'ON_HOLD' },
    { m: projectMachine, from: 'ACTIVE', to: 'COMPLETED' },
    { m: projectMachine, from: 'ACTIVE', to: 'CANCELLED' },
    { m: projectMachine, from: 'ON_HOLD', to: 'ACTIVE' },
    { m: milestoneMachine, from: 'PENDING', to: 'IN_PROGRESS' },
    { m: milestoneMachine, from: 'PENDING', to: 'CANCELLED' },
    { m: milestoneMachine, from: 'IN_PROGRESS', to: 'COMPLETED' },
    { m: milestoneMachine, from: 'IN_PROGRESS', to: 'CANCELLED' },
    { m: milestoneMachine, from: 'COMPLETED', to: 'IN_PROGRESS' },
    { m: milestoneMachine, from: 'COMPLETED', to: 'APPROVED' },
    { m: taskMachine, from: 'TODO', to: 'IN_PROGRESS' },
    { m: taskMachine, from: 'TODO', to: 'CANCELLED' },
    { m: taskMachine, from: 'IN_PROGRESS', to: 'DONE' },
    { m: taskMachine, from: 'IN_PROGRESS', to: 'CANCELLED' },
    { m: taskMachine, from: 'DONE', to: 'IN_PROGRESS' },
    { m: invoiceMachine, from: 'DRAFT', to: 'ISSUED' },
    { m: invoiceMachine, from: 'DRAFT', to: 'CANCELLED' },
    { m: invoiceMachine, from: 'ISSUED', to: 'CANCELLED' },
    { m: invoiceMachine, from: 'ISSUED', to: 'PARTIALLY_PAID' },
    { m: invoiceMachine, from: 'ISSUED', to: 'PAID' },
    { m: invoiceMachine, from: 'PARTIALLY_PAID', to: 'PAID' },
    { m: invoiceMachine, from: 'PARTIALLY_PAID', to: 'ISSUED' },
    { m: invoiceMachine, from: 'PAID', to: 'PARTIALLY_PAID' },
    { m: invoiceMachine, from: 'PAID', to: 'ISSUED' },
    { m: paymentMachine, from: 'ACTIVE', to: 'VOIDED' },
    { m: expenseMachine, from: 'ACTIVE', to: 'VOIDED' },
  ];

  it('validates every single valid transition across all 7 machines', () => {
    for (const { m, from, to, role } of validTransitions) {
      expect(() => assertTransition(m as any, from, to, role)).not.toThrow();
    }
  });

  it('rejects unauthorized roles trying to transition state', () => {
    expect(() =>
      assertTransition(quotationMachine, 'PENDING_APPROVAL', 'APPROVED', 'STAFF')
    ).toThrowError(ConflictError);

    try {
      assertTransition(quotationMachine, 'PENDING_APPROVAL', 'APPROVED', 'STAFF');
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('INVALID_STATE_TRANSITION');
    }
  });

  it('rejects invalid transitions throwing 409 ConflictError with INVALID_STATE_TRANSITION', () => {
    expect(() => assertTransition(quotationMachine, 'DRAFT', 'ACCEPTED')).toThrowError(
      ConflictError
    );
    expect(() => assertTransition(projectMachine, 'PLANNED', 'COMPLETED')).toThrowError(
      ConflictError
    );
    expect(() => assertTransition(paymentMachine, 'VOIDED', 'ACTIVE')).toThrowError(
      ConflictError
    );

    try {
      assertTransition(quotationMachine, 'DRAFT', 'ACCEPTED');
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('INVALID_STATE_TRANSITION');
    }
  });
});
