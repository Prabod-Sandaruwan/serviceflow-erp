import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';

export type Tx = Prisma.TransactionClient;

export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

export async function runInTransaction<T>(
  fn: (tx: Tx) => Promise<T>,
  opts?: TransactionOptions
): Promise<T> {
  return prisma.$transaction(async (tx) => fn(tx), {
    isolationLevel: opts?.isolationLevel ?? 'ReadCommitted',
    maxWait: opts?.maxWait ?? 5000,
    timeout: opts?.timeout ?? 10000,
  });
}

export default runInTransaction;
