import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { createLogger } from '../../src/config/logger';

describe('INFRA-003: Request IDs and Structured Logging', () => {
  it('automatically attaches a new UUID to X-Request-Id header if not sent', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    const reqId = res.headers['x-request-id'];
    expect(reqId).toBeDefined();
    expect(reqId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('preserves valid incoming X-Request-Id header', async () => {
    const customId = 'test-trace-id-abc-12345';
    const res = await request(app).get('/health').set('X-Request-Id', customId);

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('assigns req.id on Request object directly in unit isolation', () => {
    const req: any = { headers: {} };
    const res: any = { setHeader: vi.fn() };
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.id).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.id);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('verifies that redaction paths work on sensitive objects using logger', () => {
    const output: string[] = [];
    const testLogger = createLogger(
      { level: 'info' },
      { write: (chunk: string) => output.push(chunk) }
    );

    testLogger.info(
      {
        password: 'plain-secret-password',
        passwordHash: 'secret-hash-value',
        user: {
          password: 'nested-secret-password',
          passwordHash: 'nested-secret-hash',
        },
        req: {
          headers: {
            authorization: 'Bearer secret-jwt-token',
            cookie: 'sessionId=secret-cookie-val',
          },
        },
        res: {
          headers: {
            'set-cookie': 'secret-cookie-response',
          },
        },
        safeField: 'visible-data',
      },
      'redaction verification'
    );

    expect(output.length).toBe(1);
    const logged = JSON.parse(output[0]);

    expect(logged.password).toBe('[REDACTED]');
    expect(logged.passwordHash).toBe('[REDACTED]');
    expect(logged.user.password).toBe('[REDACTED]');
    expect(logged.user.passwordHash).toBe('[REDACTED]');
    expect(logged.req.headers.authorization).toBe('[REDACTED]');
    expect(logged.req.headers.cookie).toBe('[REDACTED]');
    expect(logged.res.headers['set-cookie']).toBe('[REDACTED]');
    expect(logged.safeField).toBe('visible-data');
  });
});
