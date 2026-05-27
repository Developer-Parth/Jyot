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
    console.log(`[STORAGE] initSync DATA_DIR=${DATA_DIR} exists=${existsSync(DATA_DIR)}`);
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
      console.log(`[STORAGE] Created directory ${DATA_DIR}`);
    }
    // Probe: verify directory is actually writable
    try {
      const probePath = path.join(DATA_DIR, '.probe');
      writeFileSync(probePath, 'ok');
      unlinkSync(probePath);
      console.log(`[STORAGE] Directory probe OK`);
    } catch (e: any) {
      console.error(`[STORAGE] Directory probe FAILED: ${e?.message}`);
    }
  }

  async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  private ensureLoaded(name: string) {
    if (this.cache.has(name)) return;
    const filePath = path.join(DATA_DIR, `${name}.json`);
    console.log(`[STORAGE] ensureLoaded ${name} from ${filePath} exists=${existsSync(filePath)}`);
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed: CollectionFile = JSON.parse(raw);
      this.cache.set(name, {
        nextId: parsed.nextId ?? 1,
        items: parsed.items ?? [],
      });
      console.log(`[STORAGE] Loaded ${name}: ${parsed.items?.length || 0} items, nextId=${parsed.nextId}`);
    } else {
      this.cache.set(name, { nextId: 1, items: [] });
      console.log(`[STORAGE] Created empty collection ${name}`);
    }
  }

  private async flush(name: string) {
    const state = this.cache.get(name);
    if (!state) return;
    const filePath = path.join(DATA_DIR, `${name}.json`);
    const tmpPath = filePath + '.tmp';
    console.log(`[STORAGE] flush ${name} -> ${filePath}`);
    await fs.writeFile(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
    console.log(`[STORAGE] flush ${name} OK`);
  }

  seed(...names: string[]) {
    console.log(`[STORAGE] seeding ${names.length} collections`);
    for (const name of names) {
      this.ensureLoaded(name);
    }
  }

  // ─── Sync reads ───

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

  // ─── Async writes ───

  async create<T = StoredItem>(name: string, data: Omit<T, 'id' | 'created_at'>): Promise<T & { id: number; created_at: string }> {
    console.log(`[STORE] create in ${name}`);
    this.ensureLoaded(name);
    const state = this.cache.get(name)!;
    const now = new Date().toISOString();
    const item = { ...data, id: state.nextId++, created_at: now } as any;
    state.items.push(item);
    console.log(`[STORE] created id=${item.id} in ${name}, flushing...`);
    await this.flush(name);
    console.log(`[STORE] create ${name} OK`);
    return item;
  }

  async update<T = StoredItem>(name: string, id: number, changes: Partial<T>): Promise<T | undefined> {
    console.log(`[STORE] update ${name} id=${id}`);
    this.ensureLoaded(name);
    const state = this.cache.get(name)!;
    const idx = state.items.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    state.items[idx] = { ...state.items[idx], ...changes };
    console.log(`[STORE] updated ${name} id=${id}, flushing...`);
    await this.flush(name);
    console.log(`[STORE] update ${name} id=${id} OK`);
    return state.items[idx] as T;
  }
}

const store = new JsonStore();

export default store;
