import { api } from '../services/api';

const DB_NAME = 'JyotWishVideos';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'wishId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveWishVideoLocally(wishId: number, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ wishId, blob, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getWishVideoLocal(wishId: number): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(wishId);
    req.onsuccess = () => {
      db.close();
      resolve(req.result?.blob || null);
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

export async function deleteWishVideoLocal(wishId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(wishId);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function uploadWishVideo(wishId: number, blob: Blob): Promise<string | null> {
  try {
    const result = await api.upload<{ video_id: string }>(`/wishes/${wishId}/video`, blob);
    return result.video_id;
  } catch (err) {
    console.warn('[WishVideo] Server upload failed:', err);
    return null;
  }
}

export async function getWishVideoUrl(wishId: number, hasServerVideo: boolean): Promise<string | null> {
  if (hasServerVideo) {
    try {
      const result = await api.get<{ url: string }>(`/wishes/${wishId}/video`);
      return result.url;
    } catch {
      // fall through to local
    }
  }
  const blob = await getWishVideoLocal(wishId);
  if (blob) return URL.createObjectURL(blob);
  return null;
}

export async function saveWishVideo(wishId: number, blob: Blob): Promise<void> {
  await saveWishVideoLocally(wishId, blob);
  uploadWishVideo(wishId, blob).catch(() => {});
}

export async function deleteWishVideo(wishId: number): Promise<void> {
  await deleteWishVideoLocal(wishId);
}
