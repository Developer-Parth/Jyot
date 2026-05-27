import db from './index.js';

console.log("Setting up database...");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    city TEXT,
    birth_date TEXT,
    deity TEXT,
    gotra TEXT,
    reminder_time TEXT DEFAULT '06:00',
    last_active_date TEXT,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS palm_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    reading_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS jaaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    mantra TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    goal INTEGER DEFAULT 108,
    completed_sessions INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    billing_cycle TEXT,
    amount INTEGER,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const ensureColumn = (table: string, column: string, definition: string) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

[
  ['users', 'name', 'TEXT'],
  ['users', 'phone', 'TEXT'],
  ['users', 'city', 'TEXT'],
  ['users', 'birth_date', 'TEXT'],
  ['users', 'deity', 'TEXT'],
  ['users', 'gotra', 'TEXT'],
  ['users', 'reminder_time', "TEXT DEFAULT '06:00'"],
  ['users', 'last_active_date', 'TEXT'],
  ['users', 'current_streak', 'INTEGER DEFAULT 0'],
  ['users', 'longest_streak', 'INTEGER DEFAULT 0'],
  ['jaaps', 'goal', 'INTEGER DEFAULT 108'],
  ['jaaps', 'completed_sessions', 'INTEGER DEFAULT 0'],
  ['subscriptions', 'billing_cycle', 'TEXT'],
  ['subscriptions', 'amount', 'INTEGER'],
  ['subscriptions', 'full_name', 'TEXT'],
  ['subscriptions', 'email', 'TEXT'],
  ['subscriptions', 'phone', 'TEXT'],
  ['subscriptions', 'address', 'TEXT'],
  ['subscriptions', 'city', 'TEXT'],
  ['subscriptions', 'state', 'TEXT'],
  ['subscriptions', 'pincode', 'TEXT'],
  ['subscriptions', 'payment_method', 'TEXT'],
  ['subscriptions', 'created_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
].forEach(([table, column, definition]) => ensureColumn(table, column, definition));

console.log("Database setup complete!");
