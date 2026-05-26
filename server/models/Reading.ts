import db from '../db/index.js';

export interface Reading {
  id?: number;
  user_id?: number;
  reading_text: string;
  created_at?: string;
}

export class ReadingModel {
  static create(data: { reading_text: string; user_id?: number }): number | bigint {
    const stmt = db.prepare('INSERT INTO palm_readings (reading_text, user_id) VALUES (?, ?)');
    const info = stmt.run(data.reading_text, data.user_id || null);
    return info.lastInsertRowid;
  }
}
