import mysql from 'mysql2';
import { env } from './env';

export const pool = mysql.createPool({
  uri: env.DATABASE_URL || '',
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 100,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export default pool;
