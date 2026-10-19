import { openDB } from 'idb';

const DB_NAME = 'shiksha_setu_db';
const DB_VERSION = 1;

export async function getLocalDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('dashboard_cache')) {
        db.createObjectStore('dashboard_cache', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('offline_actions_queue')) {
        db.createObjectStore('offline_actions_queue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

export async function setCachedData(key, data) {
  try {
    const db = await getLocalDB();
    await db.put('dashboard_cache', { key, data, cachedAt: Date.now() });
  } catch (err) {
    console.warn('[IndexedDB] Cache put failed:', err);
  }
}

export async function getCachedData(key) {
  try {
    const db = await getLocalDB();
    const item = await db.get('dashboard_cache', key);
    return item ? item.data : null;
  } catch (err) {
    console.warn('[IndexedDB] Cache get failed:', err);
    return null;
  }
}

export async function enqueueOfflineAction(action) {
  try {
    const db = await getLocalDB();
    await db.add('offline_actions_queue', { ...action, queuedAt: Date.now() });
  } catch (err) {
    console.warn('[IndexedDB] Enqueue offline action failed:', err);
  }
}

export async function getOfflineQueue() {
  try {
    const db = await getLocalDB();
    return await db.getAll('offline_actions_queue');
  } catch (err) {
    return [];
  }
}

export async function clearOfflineAction(id) {
  try {
    const db = await getLocalDB();
    await db.delete('offline_actions_queue', id);
  } catch (err) {
    console.warn('[IndexedDB] Delete offline action failed:', err);
  }
}
