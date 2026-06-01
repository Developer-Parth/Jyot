import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    })
  : null;

export async function query(text: string, params?: any[]) {
  if (!pool) throw new Error('DATABASE_URL not configured');
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function verifyConnection() {
  if (!pool) return false;
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export default pool;
