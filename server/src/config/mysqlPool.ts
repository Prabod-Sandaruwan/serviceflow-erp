import mysql from 'mysql2';
import { env } from './env';

export const pool = mysql.createPool(env.DATABASE_URL || '');
