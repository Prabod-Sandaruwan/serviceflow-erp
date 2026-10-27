import { describe, expect, it } from 'vitest';
import { pool } from '../../src/config/mysqlPool';
import { sessionMiddleware, sessionStore } from '../../src/middleware/session';

describe('Session Configuration (AUTH-003)', () => {
  it('initializes the MySQL pool', () => {
    expect(pool).toBeDefined();
    expect(typeof pool.query).toBe('function');
  });

  it('exports session middleware function', () => {
    expect(typeof sessionMiddleware).toBe('function');
  });

  it('configures MySQL session store with correct table schema', () => {
    expect(sessionStore).toBeDefined();
    expect(sessionStore.options?.schema?.tableName).toBe('sessions');
    expect(sessionStore.options?.schema?.columnNames?.session_id).toBe('session_id');
    expect(sessionStore.options?.createDatabaseTable).toBe(false);
  });
});
