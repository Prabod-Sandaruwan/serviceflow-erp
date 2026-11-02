import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isExpiredQuotation, today } from '../../src/shared/dates';

describe('Quotation Dynamic Expiry Calculator (QUOT-010)', () => {
  const fixedDate = new Date('2026-11-02T10:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Boundary 1: status = SENT and validUntil = EXACTLY today -> isExpired is FALSE', () => {
    const todayStr = '2026-11-02';
    expect(isExpiredQuotation({ status: 'SENT', validUntil: todayStr })).toBe(false);
    expect(isExpiredQuotation({ status: 'SENT', validUntil: new Date('2026-11-02T00:00:00.000Z') }, today())).toBe(false);
  });

  it('Boundary 2: status = SENT and validUntil = EXACTLY yesterday -> isExpired is TRUE', () => {
    const yesterdayStr = '2026-11-01';
    expect(isExpiredQuotation({ status: 'SENT', validUntil: yesterdayStr })).toBe(true);

    const yesterdayDate = new Date(Date.now() - 86400000);
    expect(isExpiredQuotation({ status: 'SENT', validUntil: yesterdayDate }, today())).toBe(true);
  });

  it('Boundary 3: validUntil = yesterday but status = ACCEPTED -> isExpired is FALSE', () => {
    const yesterdayStr = '2026-11-01';
    expect(isExpiredQuotation({ status: 'ACCEPTED', validUntil: yesterdayStr })).toBe(false);
    expect(isExpiredQuotation({ status: 'DECLINED', validUntil: yesterdayStr })).toBe(false);
    expect(isExpiredQuotation({ status: 'DRAFT', validUntil: yesterdayStr })).toBe(false);
  });

  it('Boundary 4: status = SENT and validUntil = tomorrow -> isExpired is FALSE', () => {
    const tomorrowStr = '2026-11-03';
    expect(isExpiredQuotation({ status: 'SENT', validUntil: tomorrowStr })).toBe(false);
  });
});
