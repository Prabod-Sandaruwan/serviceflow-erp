import dotenv from 'dotenv';
dotenv.config();

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Prisma } from '../generated/prisma';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getLogLevels = (): Prisma.LogLevel[] => {
  if (process.env.NODE_ENV === 'development') {
    return ['query', 'error', 'warn'];
  }
  return ['error'];
};

const createPrismaClient = (): PrismaClient => {
  const adapter = process.env.DATABASE_URL
    ? new PrismaMariaDb(process.env.DATABASE_URL)
    : undefined;

  const client = new PrismaClient({
    adapter,
    log: getLogLevels(),
  });

  const origExecute = client.$executeRawUnsafe.bind(client);
  client.$executeRawUnsafe = ((query: string, ...values: any[]) => {
    if (/\bUPDATE\s+[`"]?audit_logs[`"]?\b/i.test(query)) {
      return Promise.reject(new Error('audit_logs is append-only and immutable'));
    }
    return origExecute(query, ...values);
  }) as any;

  return client;
};

export const prisma: PrismaClient = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

export { Prisma, PrismaClient };
export default prisma;
