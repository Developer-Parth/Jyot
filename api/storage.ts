import JsonStore from './json-store.js';
import DbStore from './db-store.js';

const useDb = !!process.env.DATABASE_URL;
const store = useDb ? new DbStore() : new JsonStore();

if (useDb) {
  console.log('[STORE] Using PostgreSQL (DATABASE_URL is set)');
} else {
  console.log('[STORE] Using JSON file storage (no DATABASE_URL)');
}

export default store;
