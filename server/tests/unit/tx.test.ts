import { describe, it, expect, afterAll } from 'vitest';
import { runInTransaction } from '@/shared/tx';
import { prisma, disconnect } from '@/config/prisma';

describe('Transaction Helper (runInTransaction)', () => {
  afterAll(async () => {
    await disconnect();
  });

  it('successfully commits operations inside runInTransaction', async () => {
    const uniqueName = `Test Client Commit ${Date.now()}`;

    const createdClient = await runInTransaction(async (tx) => {
      return tx.client.create({
        data: {
          display_name: uniqueName,
          email: `commit-${Date.now()}@example.com`,
        },
      });
    });

    expect(createdClient).toBeDefined();
    expect(createdClient.display_name).toBe(uniqueName);

    const found = await prisma.client.findUnique({
      where: { id: createdClient.id },
    });
    expect(found).not.toBeNull();
    expect(found?.display_name).toBe(uniqueName);

    // Clean up
    await prisma.client.delete({
      where: { id: createdClient.id },
    });
  });

  it('rolls back all operations when an error is thrown inside runInTransaction', async () => {
    const uniqueName = `Test Client Rollback ${Date.now()}`;
    const simulatedError = new Error('SIMULATED_TRANSACTION_FAILURE');

    await expect(
      runInTransaction(async (tx) => {
        await tx.client.create({
          data: {
            display_name: uniqueName,
            email: `rollback-${Date.now()}@example.com`,
          },
        });
        throw simulatedError;
      })
    ).rejects.toThrow('SIMULATED_TRANSACTION_FAILURE');

    const found = await prisma.client.findFirst({
      where: { display_name: uniqueName },
    });
    expect(found).toBeNull();
  });
});
