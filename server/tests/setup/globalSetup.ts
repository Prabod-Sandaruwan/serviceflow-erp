import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

export function assertTestDatabase(databaseUrl: string | undefined): string {
  if (!databaseUrl || databaseUrl.trim() === '') {
    throw new Error('SAFETY GUARD TRIGGERED: DATABASE_URL is not set.');
  }

  let dbName = '';
  try {
    const url = new URL(databaseUrl);
    dbName = url.pathname.replace(/^\/+/, '').split('/')[0] || '';
  } catch {
    const match = databaseUrl.match(/\/([^/?#]+)(?:\?.*)?$/);
    dbName = match ? match[1] : '';
  }

  if (!dbName.endsWith('_test')) {
    throw new Error(
      `SAFETY GUARD TRIGGERED: Automated tests must only run against a database ending with '_test'. Current DB: '${dbName}'. Aborting to protect development data.`
    );
  }

  return dbName;
}

export default async function globalSetup(): Promise<void> {
  const envTestPath = path.resolve(__dirname, '../../.env.test');
  dotenv.config({ path: envTestPath, override: true });

  assertTestDatabase(process.env.DATABASE_URL);

  const serverDir = path.resolve(__dirname, '../../');
  execSync('npx prisma migrate deploy', {
    cwd: serverDir,
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  });
}
