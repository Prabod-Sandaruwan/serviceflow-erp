import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registeredRoutes } from '../shared/routeRegistry';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'connect.sid',
});

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ field: z.string().optional(), issue: z.string() })).optional(),
    requestId: z.string().optional(),
  }),
});

registry.register('ErrorResponse', ErrorResponseSchema);

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  responses: {
    200: {
      description: 'Service health check ok',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            database: z.string(),
            timestamp: z.string().optional(),
            uptime: z.number().optional(),
            service: z.string().optional(),
          }),
        },
      },
    },
    503: {
      description: 'Service unavailable / Database disconnected',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

export const getOpenApiSpec = () => {
  const existing = new Set(
    registry.definitions
      .filter((d: any) => d.type === 'route')
      .map((d: any) => `${d.route.method.toUpperCase()} ${d.route.path}`)
  );

  for (const r of registeredRoutes) {
    const openApiPath = r.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    const key = `${r.method.toUpperCase()} ${openApiPath}`;
    if (!existing.has(key)) {
      existing.add(key);
      registry.registerPath({
        method: r.method.toLowerCase() as any,
        path: openApiPath,
        summary: `${r.method.toUpperCase()} ${openApiPath} [${Array.isArray(r.roles) ? r.roles.join(', ') : r.roles}]`,
        security: r.roles === 'PUBLIC' ? [] : [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Successful response' },
          default: {
            description: 'Error response',
            content: { 'application/json': { schema: ErrorResponseSchema } },
          },
        },
      });
    }
  }

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'ServiceFlow ERP API',
      version: '1.0.0',
      description: 'Internal Project-Based Service ERP API',
    },
    servers: [{ url: '/' }],
  });
};

export default getOpenApiSpec;
