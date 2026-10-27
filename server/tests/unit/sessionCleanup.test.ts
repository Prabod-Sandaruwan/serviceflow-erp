import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '../../src/config/prisma';
import {
  cleanupExpiredSessions,
  purgeUserSessions,
  startSessionCleanup,
  stopSessionCleanup,
  cleanupTimer,
} from '../../src/modules/auth/sessionCleanup';

describe('Session Cleanup & User Purge (AUTH-011)', () => {
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('DELETE FROM sessions WHERE session_id LIKE "test-%"');
  });

  afterEach(async () => {
    stopSessionCleanup();
    await prisma.$executeRawUnsafe('DELETE FROM sessions WHERE session_id LIKE "test-%"');
  });

  it('cleanupExpiredSessions removes rows where expires is in the past', async () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    const future = Math.floor(Date.now() / 1000) + 3600;
    await prisma.$executeRawUnsafe(
      'INSERT INTO sessions (session_id, expires, data) VALUES ("test-exp", ?, "{}"), ("test-act", ?, "{}")',
      past, future
    );
    await cleanupExpiredSessions();
    const exp: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id = "test-exp"');
    const act: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id = "test-act"');
    expect(exp.length).toBe(0);
    expect(act.length).toBe(1);
  });

  it('purgeUserSessions deletes all session rows for a specific user using LIKE', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const userJson = '{"cookie":{},"userId":"888","role":"ADMIN"}';
    const otherJson = '{"cookie":{},"userId":"999","role":"ADMIN"}';
    await prisma.$executeRawUnsafe(
      'INSERT INTO sessions (session_id, expires, data) VALUES ("test-u1", ?, ?), ("test-u2", ?, ?), ("test-o1", ?, ?)',
      future, userJson, future, userJson, future, otherJson
    );
    await purgeUserSessions(BigInt(888));
    const uRows: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id IN ("test-u1", "test-u2")');
    const oRows: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id = "test-o1"');
    expect(uRows.length).toBe(0);
    expect(oRows.length).toBe(1);
  });

  it('purgeUserSessions preserves current session when currentSessionIdToKeep is provided', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const userJson = '{"cookie":{},"userId":"777","role":"STAFF"}';
    await prisma.$executeRawUnsafe(
      'INSERT INTO sessions (session_id, expires, data) VALUES ("test-keep", ?, ?), ("test-purge", ?, ?)',
      future, userJson, future, userJson
    );
    await purgeUserSessions(BigInt(777), 'test-keep');
    const kept: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id = "test-keep"');
    const purged: any[] = await prisma.$queryRawUnsafe('SELECT session_id FROM sessions WHERE session_id = "test-purge"');
    expect(kept.length).toBe(1);
    expect(purged.length).toBe(0);
  });

  it('startSessionCleanup and stopSessionCleanup manage the timer', () => {
    startSessionCleanup();
    expect(cleanupTimer).not.toBeNull();
    stopSessionCleanup();
  });
});
