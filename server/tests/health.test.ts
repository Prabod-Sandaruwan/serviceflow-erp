import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Health Check API', () => {
  it('GET /api/v1/health should return status 200 with service status ok', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('service', 'ServiceFlow ERP API');
  });

  it('GET /api/v1/unknown-endpoint should return 404 for nonexistent routes', async () => {
    const response = await request(app).get('/api/v1/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Route not found',
    });
  });
});
