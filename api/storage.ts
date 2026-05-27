import fs from 'fs/promises';
import { readFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
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

  initSync() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    try {
      const probePath = path.join(DATA_DIR, '.probe');
      writeFileSync(probePath, 'ok');
      unlinkSync(probePath);
    } catch (e: any) {
      console.error('[STORAGE] Directory probe FAILED:', e?.message);
    }
  }

  async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

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

  private async flush(name: string) {
    const state = this.cache.get(name);
    if (!state) return;
    const filePath = path.join(DATA_DIR, `${name}.json`);
    const tmpPath = filePath + '.tmp';
    await fs.writeFile(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  }

  seed(...names: string[]) {
    for (const name of names) {
      this.ensureLoaded(name);
    }
  }

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
