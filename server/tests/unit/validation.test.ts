import { describe, it, expect } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import {
  idParamSchema,
  moneyStringSchema,
  dateStringSchema,
  paginationQuerySchema,
} from '../../src/shared/schemas';
import { validate } from '../../src/middleware/validate';
import { errorHandler } from '../../src/middleware/error';

describe('INFRA-004: Validation Schemas & Middleware', () => {
  it('moneyStringSchema: accepts valid money strings, rejects numbers, >2 decimals, and negatives', () => {
    expect(moneyStringSchema.safeParse('100').success).toBe(true);
    expect(moneyStringSchema.safeParse('100.50').success).toBe(true);
    expect(moneyStringSchema.safeParse('0.05').success).toBe(true);
    expect(moneyStringSchema.safeParse(100).success).toBe(false);
    expect(moneyStringSchema.safeParse('100.555').success).toBe(false);
    expect(moneyStringSchema.safeParse('-50').success).toBe(false);
    expect(moneyStringSchema.safeParse('abc').success).toBe(false);
  });

  it('idParamSchema: accepts positive integers, rejects 0, negatives, and non-numeric', () => {
    expect(idParamSchema.safeParse('1').success).toBe(true);
    expect(idParamSchema.safeParse('999').success).toBe(true);
    expect(idParamSchema.safeParse('0').success).toBe(false);
    expect(idParamSchema.safeParse('-5').success).toBe(false);
    expect(idParamSchema.safeParse('abc').success).toBe(false);
  });

  it('dateStringSchema: validates calendar dates and rejects leap-year mismatches/invalid months', () => {
    expect(dateStringSchema.safeParse('2026-05-15').success).toBe(true);
    expect(dateStringSchema.safeParse('2024-02-29').success).toBe(true);
    expect(dateStringSchema.safeParse('2026-02-29').success).toBe(false);
    expect(dateStringSchema.safeParse('2026-13-01').success).toBe(false);
    expect(dateStringSchema.safeParse('2026-04-31').success).toBe(false);
  });

  it('paginationQuerySchema: provides default page/limit and enforces constraints', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(paginationQuerySchema.parse({ page: '3', limit: '50' })).toEqual({
      page: 3,
      limit: 50,
    });
    expect(paginationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('validate middleware: populates req.valid on valid payload', async () => {
    const testApp = express();
    testApp.use(express.json());
    const schema = { body: z.object({ amount: moneyStringSchema }) };

    testApp.post('/test', validate(schema), (req: Request, res: Response) => {
      res.json({ valid: req.valid });
    });

    const res = await request(testApp).post('/test').send({ amount: '100.50' });
    expect(res.status).toBe(200);
    expect(res.body.valid.body).toEqual({ amount: '100.50' });
  });

  it('validate middleware: returns 422 VALIDATION_ERROR on invalid payload', async () => {
    const testApp = express();
    testApp.use(express.json());
    const schema = { body: z.object({ amount: moneyStringSchema }) };

    testApp.post('/test', validate(schema), (_req: Request, res: Response) => {
      res.json({ ok: true });
    });
    testApp.use(errorHandler);

    const res = await request(testApp).post('/test').send({ amount: 'invalid' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'amount' })])
    );
  });
});
