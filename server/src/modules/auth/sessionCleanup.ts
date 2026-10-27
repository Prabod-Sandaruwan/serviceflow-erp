import prisma from '../../config/prisma';

export async function cleanupExpiredSessions(): Promise<number> {
  return prisma.$executeRawUnsafe('DELETE FROM sessions WHERE expires < UNIX_TIMESTAMP()');
}

export async function purgeUserSessions(
  userId: bigint,
  currentSessionIdToKeep?: string
): Promise<number> {
  const searchToken = '%"userId":"' + userId.toString() + '"%';
  if (currentSessionIdToKeep) {
    return prisma.$executeRawUnsafe(
      'DELETE FROM sessions WHERE data LIKE ? AND session_id != ?',
      searchToken,
      currentSessionIdToKeep
    );
  }
  return prisma.$executeRawUnsafe('DELETE FROM sessions WHERE data LIKE ?', searchToken);
}

export let cleanupTimer: NodeJS.Timeout | null = null;

export function startSessionCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
  }
  cleanupExpiredSessions().catch(() => console.error('Session cleanup failed'));
  cleanupTimer = setInterval(() => {
    cleanupExpiredSessions().catch(() => console.error('Session cleanup failed'));
  }, 15 * 60 * 1000);
}

export function stopSessionCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

export default {
  cleanupExpiredSessions,
  purgeUserSessions,
  startSessionCleanup,
  stopSessionCleanup,
};
