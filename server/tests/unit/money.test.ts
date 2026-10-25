import { describe, it, expect } from 'vitest';
import { Prisma } from '../../src/generated/prisma';
import {
  add,
  sub,
  mul,
  sum,
  lineAmount,
  round,
  toFixed2,
  fromPrisma,
  parseMoney,
  eq,
  gt,
  gte,
  lt,
  lte,
} from '../../src/shared/money';

describe('INFRA-006: Decimal-safe Money Module', () => {
  it('avoids floating point inaccuracies (e.g. 0.1 + 0.2 = "0.30")', () => {
    expect(add('0.10', '0.20')).toBe('0.30');
    expect(add('0.1', '0.2')).toBe('0.30');
    expect(sub('0.30', '0.10')).toBe('0.20');
  });

  it('performs ROUND_HALF_UP correctly on 2.675 and 2.674', () => {
    expect(round('2.675', 2)).toBe('2.68');
    expect(round('2.674', 2)).toBe('2.67');
    expect(round(2.675, 2)).toBe('2.68');
  });

  it('computes lineAmount with half-up rounding (1.5 * 33.33 = 50.00)', () => {
    expect(lineAmount('1.5', '33.33')).toBe('50.00');
    expect(lineAmount(1.5, '33.33')).toBe('50.00');
    expect(mul('33.33', 1.5)).toBe('50.00');
  });

  it('computes large sums without IEEE-754 precision loss', () => {
    const items = ['9999999999.99', '0.01', '5000000000.50'];
    expect(sum(items)).toBe('15000000000.50');
    expect(sum([])).toBe('0.00');
  });

  it('handles negative balances and subtraction (100.00 - 150.00 = -50.00)', () => {
    expect(sub('100.00', '150.00')).toBe('-50.00');
    expect(toFixed2('-50.00')).toBe('-50.00');
    expect(add('-50.00', '20.00')).toBe('-30.00');
  });

  it('rejects numbers with TypeError and >2 decimals with Error in parseMoney', () => {
    expect(() => parseMoney(100 as any)).toThrow(TypeError);
    expect(() => parseMoney('100.555')).toThrow(Error);
    expect(() => parseMoney('invalid')).toThrow(Error);
  });

  it('evaluates comparisons (eq, gt, gte, lt, lte) accurately', () => {
    expect(eq('10.00', '10')).toBe(true);
    expect(gt('10.01', '10.00')).toBe(true);
    expect(gte('10.00', '10.00')).toBe(true);
    expect(lt('9.99', '10.00')).toBe(true);
    expect(lte('10.00', '10.00')).toBe(true);
  });

  it('formats Prisma Decimal and nullish values safely with fromPrisma', () => {
    expect(fromPrisma(null)).toBe('0.00');
    expect(fromPrisma(undefined)).toBe('0.00');
    expect(fromPrisma(new Prisma.Decimal('1234.50'))).toBe('1234.50');
  });
});
