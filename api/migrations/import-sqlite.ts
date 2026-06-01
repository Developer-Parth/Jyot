/**
 * Import orphaned records from the legacy SQLite database into Supabase.
 *
 * Usage: npx tsx api/migrations/import-sqlite.ts
 *
 * Prerequisites:
 *   DATABASE_URL must be set in .env (Supabase connection pooler).
 *   The schema from 001_initial.sql must have been applied to Supabase.
 *
 * The script reads the legacy database.sqlite file at the project root
 * and inserts any records that don't already exist in the target tables
 * (matched by email for users, or by id for other entities).
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sqlite3 = require('better-sqlite3') as any;

import { query } from '../db.js';

const DB_PATH = require('path').join(process.cwd(), 'database.sqlite');

function openSqlite() {
  const fs = require('fs');
  if (!fs.existsSync(DB_PATH)) {
    console.error(`SQLite database not found at ${DB_PATH}`);
    process.exit(1);
  }
  const db = new sqlite3(DB_PATH);
  return db;
}

async function importUsers(db: any) {
  console.log('\n--- Users ---');
  const rows = db.prepare('SELECT * FROM users ORDER BY id').all();
  for (const row of rows) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [row.email]);
    if (existing.rows.length > 0) {
      console.log(`  SKIP ${row.email} (id=${row.id}) — already exists as id=${existing.rows[0].id}`);
      continue;
    }
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, city, birth_date, deity, gotra, reminder_time, last_active_date, current_streak, longest_streak, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [row.email, row.password_hash, row.name, row.phone, row.city, row.birth_date, row.deity, row.gotra, row.reminder_time, row.last_active_date, row.current_streak, row.longest_streak, row.created_at],
    );
    console.log(`  IMPORTED ${row.email} as id=${result.rows[0].id} (was SQLite id=${row.id})`);
  }
}

async function importSubscriptions(db: any) {
  console.log('\n--- Subscriptions ---');
  const rows = db.prepare('SELECT * FROM subscriptions ORDER BY id').all();
  for (const row of rows) {
    const existing = await query('SELECT id FROM subscriptions WHERE id = $1', [row.id]);
    if (existing.rows.length > 0) {
      console.log(`  SKIP subscription id=${row.id} — already exists`);
      continue;
    }
    await query(
      `INSERT INTO subscriptions (id, user_id, plan, status, billing_cycle, amount, full_name, email, phone, address, city, state, pincode, payment_method, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [row.id, row.user_id, row.plan, row.status, row.billing_cycle, row.amount, row.full_name, row.email, row.phone, row.address, row.city, row.state, row.pincode, row.payment_method, row.created_at],
    );
    console.log(`  IMPORTED subscription id=${row.id} (user_id=${row.user_id})`);
  }
}

async function importJaaps(db: any) {
  console.log('\n--- Jaaps ---');
  const rows = db.prepare('SELECT * FROM jaaps ORDER BY id').all();
  for (const row of rows) {
    const existing = await query('SELECT id FROM jaaps WHERE id = $1', [row.id]);
    if (existing.rows.length > 0) {
      console.log(`  SKIP jaap id=${row.id} — already exists`);
      continue;
    }
    await query(
      `INSERT INTO jaaps (id, user_id, mantra, count, goal, completed_sessions, updated_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [row.id, row.user_id, row.mantra, row.count, row.goal, row.completed_sessions, row.updated_at, row.created_at],
    );
    console.log(`  IMPORTED jaap id=${row.id} (user_id=${row.user_id}, mantra=${row.mantra})`);
  }
}

async function importPalmReadings(db: any) {
  console.log('\n--- Palm Readings ---');
  const rows = db.prepare('SELECT * FROM palm_readings ORDER BY id').all();
  for (const row of rows) {
    const existing = await query('SELECT id FROM palm_readings WHERE id = $1', [row.id]);
    if (existing.rows.length > 0) {
      console.log(`  SKIP palm_reading id=${row.id} — already exists`);
      continue;
    }
    await query(
      `INSERT INTO palm_readings (id, user_id, reading_text, created_at)
       VALUES ($1,$2,$3,$4)`,
      [row.id, row.user_id, row.reading_text, row.created_at],
    );
    console.log(`  IMPORTED palm_reading id=${row.id}`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL must be set. Run this after Supabase migration is deployed.');
    process.exit(1);
  }

  console.log(`Opening SQLite: ${DB_PATH}`);
  const db = openSqlite();

  console.log('Target: PostgreSQL (Supabase)');
  console.log('='.repeat(50));

  try {
    await importUsers(db);
    await importSubscriptions(db);
    await importJaaps(db);
    await importPalmReadings(db);
    console.log('\nImport complete.');
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
