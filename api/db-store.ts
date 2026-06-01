import { query } from './db.js';

interface StoredItem {
  id: number;
  [key: string]: any;
}

class DbStore {
  async init() {}
  initSync() {}
  seed(..._names: string[]) {}

  async all<T = StoredItem>(name: string): Promise<T[]> {
    const result = await query(`SELECT * FROM ${name} ORDER BY id ASC`);
    return result.rows as T[];
  }

  async getById<T = StoredItem>(name: string, id: number): Promise<T | undefined> {
    const result = await query(`SELECT * FROM ${name} WHERE id = $1`, [id]);
    return result.rows[0] as T | undefined;
  }

  async findOne<T = StoredItem>(name: string, predicate: (item: T) => boolean): Promise<T | undefined> {
    const items = await this.all<T>(name);
    return items.find(predicate);
  }

  async where<T = StoredItem>(name: string, predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.all<T>(name);
    return items.filter(predicate);
  }

  async create<T = StoredItem>(name: string, data: Omit<T, 'id' | 'created_at'>): Promise<T & { id: number; created_at: string }> {
    const keys = Object.keys(data as any);
    const values = Object.values(data as any);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const cols = keys.join(', ');
    const result = await query(
      `INSERT INTO ${name} (${cols}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async update<T = StoredItem>(name: string, id: number, changes: Partial<T>): Promise<T | undefined> {
    const keys = Object.keys(changes as any);
    if (keys.length === 0) return this.getById<T>(name, id);
    const values = Object.values(changes as any);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(id);
    const result = await query(
      `UPDATE ${name} SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] as T | undefined;
  }

  async delete(name: string, id: number): Promise<boolean> {
    const result = await query(`DELETE FROM ${name} WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteWhere(name: string, predicate: (item: any) => boolean): Promise<number> {
    const items = await this.all(name);
    const toDelete = items.filter(predicate);
    if (toDelete.length === 0) return 0;
    const ids = toDelete.map(i => i.id);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(`DELETE FROM ${name} WHERE id IN (${placeholders})`, ids);
    return result.rowCount ?? 0;
  }
}

export default DbStore;
