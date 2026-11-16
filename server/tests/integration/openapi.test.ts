import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { getOpenApiSpec } from '../../src/config/openapi.js';
import { registeredRoutes } from '../../src/shared/routeRegistry.js';

describe('REL-007: OpenAPI Documentation', () => {
  it('generates a valid OpenAPI 3.0 specification document', () => {
    const spec = getOpenApiSpec();
    expect(spec.openapi).toMatch(/^3\.0\./);
    expect(spec.info.title).toContain('ServiceFlow ERP API');
    expect(spec.paths).toBeDefined();
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });

  it('contains paths for registered routes', () => {
    const spec = getOpenApiSpec();
    expect(registeredRoutes.length).toBeGreaterThan(0);

    for (const r of registeredRoutes) {
      const openApiPath = r.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
      const pathItem = spec.paths[openApiPath];
      expect(pathItem, `Missing spec path for ${openApiPath}`).toBeDefined();
      expect(
        pathItem[r.method.toLowerCase()],
        `Missing method ${r.method} on ${openApiPath}`
      ).toBeDefined();
    }
  });

  it('serves OpenAPI JSON at /api-docs.json with 200 OK', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\.0\./);
    expect(res.body.paths).toBeDefined();
  });
});
