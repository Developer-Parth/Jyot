import fs from 'fs/promises';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp/data' : path.join(process.cwd(), 'server', 'data');

interface StoredItem {
  id: number;
  [key: string]: any;
}

interface CollectionFile {
  nextId: number;
  items: StoredItem[];
}

class JsonStore {
  private cache = new Map<string, CollectionFile>();

  /** Synchronous init — runs at module load time (works for Vercel serverless) */
  initSync() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /** Async init — used during local dev startup */
  async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  /** Ensure a collection is loaded into memory. Safe to call multiple times. */
  private ensureLoaded(name: string) {
    if (this.cache.has(name)) return;
    const filePath = path.join(DATA_DIR, `${name}.json`);
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed: CollectionFile = JSON.parse(raw);
      this.cache.set(name, {
        nextId: parsed.nextId ?? 1,
        items: parsed.items ?? [],
      });
    } else {
      this.cache.set(name, { nextId: 1, items: [] });
    }
  }

  /** Write collection to disk atomically */
  private async flush(name: string) {
    const state = this.cache.get(name);
    if (!state) return;
    const filePath = path.join(DATA_DIR, `${name}.json`);
    const tmpPath = filePath + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  }

  /** Load one or more collections into memory by name */
  seed(...names: string[]) {
    for (const name of names) {
      this.ensureLoaded(name);
    }
  }

  // ─── Sync reads (from in-memory cache) ───

  all<T = StoredItem>(name: string): T[] {
    this.ensureLoaded(name);
    return this.cache.get(name)!.items as T[];
  }

  getById<T = StoredItem>(name: string, id: number): T | undefined {
    this.ensureLoaded(name);
    return this.cache.get(name)!.items.find(i => i.id === id) as T | undefined;
  }

  findOne<T = StoredItem>(name: string, predicate: (item: T) => boolean): T | undefined {
    this.ensureLoaded(name);
    return this.cache.get(name)!.items.find(predicate as any) as T | undefined;
  }

  where<T = StoredItem>(name: string, predicate: (item: T) => boolean): T[] {
    this.ensureLoaded(name);
    return this.cache.get(name)!.items.filter(predicate as any) as T[];
  }

  // ─── Async writes (flush to disk) ───

  async create<T = StoredItem>(name: string, data: Omit<T, 'id' | 'created_at'>): Promise<T & { id: number; created_at: string }> {
    this.ensureLoaded(name);
    const state = this.cache.get(name)!;
    const now = new Date().toISOString();
    const item = { ...data, id: state.nextId++, created_at: now } as any;
    state.items.push(item);
    await this.flush(name);
    return item;
  }

  async update<T = StoredItem>(name: string, id: number, changes: Partial<T>): Promise<T | undefined> {
    this.ensureLoaded(name);
    const state = this.cache.get(name)!;
    const idx = state.items.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    state.items[idx] = { ...state.items[idx], ...changes };
    await this.flush(name);
    return state.items[idx] as T;
  }
}

const store = new JsonStore();

export default store;
