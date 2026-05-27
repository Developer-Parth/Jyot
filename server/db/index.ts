import Database from 'better-sqlite3';
import path from 'path';

const isVercel = !!process.env.VERCEL;

// Use /tmp on Vercel (read-write), otherwise project root
const dbDir = isVercel ? '/tmp' : process.cwd();
const dbPath = path.resolve(dbDir, 'database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export default db;
