import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite database
const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath); // removed verbose logging to keep terminal clean

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;
