import { describe, it, expect } from 'vitest';
import {
  today,
  formatDate,
  isBefore,
  isOverdueInvoice,
  isExpiredQuotation,
  isOverdueTask,
} from '../../src/shared/dates';
import { derivedStates } from '../../src/shared/state';

describe('INFRA-008: Company Timezone & Derived Status Helpers', () => {
  it('handles Colombo midnight boundary and month rollover in today()', () => {
    const beforeMidnight = new Date('2026-10-31T18:29:59.000Z');
    const atMidnight = new Date('2026-10-31T18:30:00.000Z');

    expect(today(beforeMidnight)).toBe('2026-10-31');
    expect(today(atMidnight)).toBe('2026-11-01');
    expect(formatDate('2026-10-31T12:00:00.000Z')).toBe('2026-10-31');
    expect(isBefore('2026-10-31', '2026-11-01')).toBe(true);
    expect(isBefore('2026-11-01', '2026-10-31')).toBe(false);
  });

  it('isOverdueInvoice: ISSUED/PARTIALLY_PAID past due returns true; PAID returns false; future returns false', () => {
    const currentDay = '2026-11-05';

    expect(
      isOverdueInvoice({ status: 'ISSUED', dueDate: '2026-11-01', balance: '100.00' }, currentDay)
    ).toBe(true);
    expect(
      isOverdueInvoice({ status: 'PARTIALLY_PAID', dueDate: '2026-11-04', balance: 50 }, currentDay)
    ).toBe(true);
    expect(
      isOverdueInvoice({ status: 'PAID', dueDate: '2026-11-01', balance: '0.00' }, currentDay)
    ).toBe(false);
    expect(
      isOverdueInvoice({ status: 'ISSUED', dueDate: '2026-11-01', balance: '0.00' }, currentDay)
    ).toBe(false);
    expect(
      isOverdueInvoice({ status: 'ISSUED', dueDate: '2026-11-10', balance: '100.00' }, currentDay)
    ).toBe(false);
  });

  it('isExpiredQuotation: SENT past validUntil returns true; DRAFT returns false; future returns false', () => {
    const currentDay = '2026-11-05';

    expect(isExpiredQuotation({ status: 'SENT', validUntil: '2026-11-01' }, currentDay)).toBe(true);
    expect(isExpiredQuotation({ status: 'DRAFT', validUntil: '2026-11-01' }, currentDay)).toBe(false);
    expect(isExpiredQuotation({ status: 'SENT', validUntil: '2026-11-10' }, currentDay)).toBe(false);
  });

  it('isOverdueTask: TODO/IN_PROGRESS past dueDate returns true; DONE/CANCELLED returns false', () => {
    const currentDay = '2026-11-05';

    expect(isOverdueTask({ status: 'TODO', dueDate: '2026-11-01' }, currentDay)).toBe(true);
    expect(isOverdueTask({ status: 'IN_PROGRESS', dueDate: '2026-11-01' }, currentDay)).toBe(true);
    expect(isOverdueTask({ status: 'DONE', dueDate: '2026-11-01' }, currentDay)).toBe(false);
    expect(isOverdueTask({ status: 'CANCELLED', dueDate: '2026-11-01' }, currentDay)).toBe(false);
    expect(isOverdueTask({ status: 'TODO', dueDate: null }, currentDay)).toBe(false);
    expect(isOverdueTask({ status: 'TODO', dueDate: '2026-11-10' }, currentDay)).toBe(false);
  });

  it('exports derivedStates from state.ts', () => {
    expect(derivedStates.isOverdueInvoice).toBe(isOverdueInvoice);
    expect(derivedStates.isExpiredQuotation).toBe(isExpiredQuotation);
    expect(derivedStates.isOverdueTask).toBe(isOverdueTask);
  });
});
