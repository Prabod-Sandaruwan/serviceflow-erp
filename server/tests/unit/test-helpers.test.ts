import { describe, it, expect, afterAll } from 'vitest';
import { prisma, disconnect } from '../../src/config/prisma';
import { makeAgent } from '../helpers/agent';
import {
  truncateAll,
  createEmployee,
  createClient,
} from '../helpers/factories';

describe('INFRA-011: Test Utilities & Factories', () => {
  afterAll(async () => {
    await truncateAll();
    await disconnect();
  });

  it('truncateAll cleans data and does not touch unauthorized DBs', async () => {
    const client = await createClient();
    expect(client).toBeDefined();

    await truncateAll();
    const count = await prisma.client.count();
    expect(count).toBe(0);

    const originalUrl = process.env.DATABASE_URL;
    try {
      process.env.DATABASE_URL = 'mysql://root:pass@localhost:3306/serviceflow_prod';
      await expect(truncateAll()).rejects.toThrow(/non-test database/i);
    } finally {
      process.env.DATABASE_URL = originalUrl;
    }
  });

  it('createEmployee and createClient factories create valid rows in test DB', async () => {
    const employee = await createEmployee({ fullName: 'Special Agent Developer' });
    expect(employee.id).toBeDefined();
    expect(employee.full_name).toBe('Special Agent Developer');

    const client = await createClient({ displayName: 'Omega Holdings' });
    expect(client.id).toBeDefined();
    expect(client.display_name).toBe('Omega Holdings');

    const clientDb = await prisma.client.findUnique({ where: { id: client.id } });
    expect(clientDb).not.toBeNull();
  });

  it('makeAgent creates an active supertest agent that hits /health successfully in < 10 lines', async () => {
    const agent = makeAgent();
    const res = await agent.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
