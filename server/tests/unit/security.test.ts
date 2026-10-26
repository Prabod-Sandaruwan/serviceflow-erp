import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { CLIENT_ORIGIN } from '../../src/middleware/security';

describe('INFRA-009: Security Headers & CORS Middleware', () => {
  it('includes Helmet security headers on responses', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('receives CORS headers when Origin matches CLIENT_ORIGIN', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', CLIENT_ORIGIN);

    expect(res.headers['access-control-allow-origin']).toBe(CLIENT_ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['vary']).toMatch(/Origin/);
  });

  it('does NOT receive Access-Control-Allow-Origin for unauthorized Origin', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://evil.com');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('returns 204 with allowed methods and headers on OPTIONS preflight from CLIENT_ORIGIN', async () => {
    const res = await request(app)
      .options('/health')
      .set('Origin', CLIENT_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set(
        'Access-Control-Request-Headers',
        'Content-Type, X-CSRF-Token, Idempotency-Key'
      );

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(CLIENT_ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-allow-methods']).toBe(
      'GET,POST,PATCH,DELETE'
    );
    expect(res.headers['access-control-allow-headers']).toBe(
      'Content-Type,X-CSRF-Token,Idempotency-Key'
    );
  });

  it('does NOT return CORS headers on OPTIONS preflight from unauthorized origin', async () => {
    const res = await request(app)
      .options('/health')
      .set('Origin', 'http://evil.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-methods']).toBeUndefined();
  });
});
