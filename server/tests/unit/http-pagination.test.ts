import { describe, it, expect, vi } from 'vitest';
import { Prisma } from '../../src/generated/prisma';
import { ValidationError } from '../../src/shared/errors';
import { parsePaging, parseSort } from '../../src/shared/pagination';
import { toJson, ok, created, paged } from '../../src/shared/http';

describe('INFRA-005: Response, Pagination and Sorting Helpers', () => {
  it('toJson: serializes BigInt and Prisma.Decimal to string while preserving dates/primitives', () => {
    const input = {
      id: BigInt(9007199254740991),
      amount: new Prisma.Decimal('1234.56'),
      active: true,
      count: 42,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      tags: [BigInt(1), new Prisma.Decimal('9.99')],
    };
    const result = toJson(input);
    expect(result.id).toBe('9007199254740991');
    expect(result.amount).toBe('1234.56');
    expect(result.active).toBe(true);
    expect(result.count).toBe(42);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.tags).toEqual(['1', '9.99']);
  });

  it('parsePaging: returns defaults for empty query and calculates skip/take', () => {
    const def = parsePaging({});
    expect(def).toEqual({ page: 1, pageSize: 20, skip: 0, take: 20 });

    const custom = parsePaging({ page: '3', pageSize: '15' });
    expect(custom).toEqual({ page: 3, pageSize: 15, skip: 30, take: 15 });
  });

  it('parsePaging: throws ValidationError on page < 1 or pageSize > 100', () => {
    expect(() => parsePaging({ page: '0' })).toThrow(ValidationError);
    expect(() => parsePaging({ pageSize: '101' })).toThrow(ValidationError);
    expect(() => parsePaging({ page: '-2', pageSize: '0' })).toThrow(ValidationError);
  });

  it('parseSort: parses descending "-", ascending "+", and validates allowed fields', () => {
    const allowed = ['createdAt', 'name', 'amount'] as const;
    const def = { createdAt: 'desc' as const };

    expect(parseSort(undefined, allowed, def)).toEqual(def);
    expect(parseSort('-name', allowed, def)).toEqual({ name: 'desc' });
    expect(parseSort('+amount', allowed, def)).toEqual({ amount: 'asc' });
    expect(parseSort('name', allowed, def)).toEqual({ name: 'asc' });
    expect(() => parseSort('unknownField', allowed, def)).toThrow(ValidationError);
  });

  it('ok, created, and paged: send formatted JSON envelope with status codes', () => {
    const mockRes = () => {
      const res: any = {};
      res.status = vi.fn().mockReturnValue(res);
      res.json = vi.fn().mockReturnValue(res);
      return res;
    };

    const res1 = mockRes();
    ok(res1, { balance: new Prisma.Decimal('50.25') });
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith({ data: { balance: '50.25' } });

    const res2 = mockRes();
    created(res2, { id: BigInt(5) });
    expect(res2.status).toHaveBeenCalledWith(201);
    expect(res2.json).toHaveBeenCalledWith({ data: { id: '5' } });

    const res3 = mockRes();
    paged(res3, [{ id: 1 }], { page: 1, pageSize: 10, total: 25 });
    expect(res3.status).toHaveBeenCalledWith(200);
    expect(res3.json).toHaveBeenCalledWith({
      data: [{ id: 1 }],
      meta: { page: 1, pageSize: 10, total: 25, totalPages: 3 },
    });
  });
});
