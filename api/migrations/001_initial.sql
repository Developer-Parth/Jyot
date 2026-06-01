-- 001_initial.sql — Supabase schema for Jyot

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  city TEXT,
  birth_date TEXT DEFAULT '',
  deity TEXT DEFAULT 'Shiva',
  gotra TEXT DEFAULT '',
  reminder_time TEXT DEFAULT '06:00',
  last_active_date TEXT,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  billing_cycle TEXT,
  amount INTEGER,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  pincode TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'upi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jaaps (chant records)
CREATE TABLE IF NOT EXISTS jaaps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mantra TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 108,
  completed_sessions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishes (metadata only — video blobs stay client-side in IndexedDB)
CREATE TABLE IF NOT EXISTS wishes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT DEFAULT '',
  video_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Palm readings
CREATE TABLE IF NOT EXISTS palm_readings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reading_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
