import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { getOpenApiSpec } from '../../src/config/openapi';

describe('INFRA-012: OpenAPI Registry and Swagger UI', () => {
  it('generates valid OpenAPI 3.0 document containing info, servers, and securitySchemes', () => {
    const doc = getOpenApiSpec();

    expect(doc.openapi).toBe('3.0.0');
    expect(doc.info.title).toBe('ServiceFlow ERP API');
    expect(doc.info.version).toBe('1.0.0');
    expect(doc.servers).toEqual([{ url: '/' }]);
    expect(doc.components?.securitySchemes?.cookieAuth).toEqual({
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
    });
  });

  it('verifies /health endpoint and ErrorResponse schema exist in the generated spec', () => {
    const doc = getOpenApiSpec();

    expect(doc.paths?.['/health']).toBeDefined();
    expect(doc.paths?.['/health']?.get?.summary).toBe('Health check');
    expect(doc.components?.schemas?.ErrorResponse).toBeDefined();
  });

  it('integration test: GET /api-docs.json returns 200 and valid JSON', async () => {
    const res = await request(app).get('/api-docs.json');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('ServiceFlow ERP API');
    expect(res.body.paths['/health']).toBeDefined();
  });
});
