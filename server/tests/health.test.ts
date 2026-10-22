import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma, disconnect } from '../src/config/prisma';

describe('Health Check API', () => {
  afterAll(async () => {
    await disconnect();
  });

  it('GET /api/v1/health should return status 200 with service status ok and database connected', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('database', 'connected');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('service', 'ServiceFlow ERP API');
  });

  it('GET /health should return status 200 with database connected', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    });
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /health should return 503 when database ping fails', async () => {
    const originalQueryRaw = prisma.$queryRawUnsafe;
    (prisma as any).$queryRawUnsafe = async () => {
      throw new Error('Database connection lost');
    };

    try {
      const response = await request(app).get('/health');
      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        status: 'error',
        database: 'disconnected',
        error: 'Database ping failed',
      });
    } finally {
      (prisma as any).$queryRawUnsafe = originalQueryRaw;
    }
  });

  it('GET /api/v1/unknown-endpoint should return 404 for nonexistent routes', async () => {
    const response = await request(app).get('/api/v1/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(response.body.error.message).toContain('Route not found: GET /api/v1/unknown-endpoint');
  });
});
