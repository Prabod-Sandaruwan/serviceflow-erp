import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { pool } from '../config/mysqlPool';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: string;
    csrfToken?: string;
    createdAt?: number;
  }
}

const MySQLStore = MySQLStoreFactory(session as any);

export const sessionStore = new MySQLStore(
  {
    createDatabaseTable: false,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  },
  pool as any
);

export const sessionMiddleware = session({
  name: 'sf.sid',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 8 * 3600000,
  },
});
