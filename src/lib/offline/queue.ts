// src/lib/offline/queue.ts
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'worklin-offline-db';
const STORE_NAME = 'offline-queue';

/**
 * Offline Operations Queue
 * * This module manages a local IndexedDB queue for storing actions
 * performed when the user is offline.
 * * Strategy:
 * 1. UI components call normal DB functions (e.g., createBlock).
 * 2. DB function detects `!navigator.onLine`.
 * 3. Instead of Firestore, the action is saved here.
 * 4. When online returns, the `sync.ts` module replays these actions.
 */

export interface OfflineOperation {
    id?: number; // Auto-incremented ID by IndexedDB
    type: 'updatePage' | 'createPage' | 'deletePage' | 'updateBlock' | 'createBlock' | 'deleteBlock' | 'restorePage' | 'permanentlyDeletePage';
    payload: any; // The data required to perform the operation
    timestamp: number; // When the action occurred (for ordering)
}

// Singleton promise to keep the DB connection open/reusable
let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Initializes or retrieves the IndexedDB connection.
 * Creates the object store if it doesn't exist.
 */
function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    }
    return dbPromise;
}

/**
 * Adds a new operation to the offline queue.
 * Called by database.ts when network is unavailable.
 * * @param operation - The action details (type and data payload)
 */
export const addToQueue = async (operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
    const db = await getDB();
    const op: OfflineOperation = {
        ...operation,
        timestamp: Date.now(),
    };
    await db.add(STORE_NAME, op);
    console.log('Operation added to offline queue:', op);
};

/**
 * Retrieves all queued operations.
 * Used by the sync manager to replay actions when connection is restored.
 */
export const getQueue = async (): Promise<OfflineOperation[]> => {
    const db = await getDB();
    return db.getAll(STORE_NAME);
};

/**
 * Removes a single operation from the queue.
 * Usually called after the operation has been successfully synced to Firestore.
 */
export const removeFromQueue = async (id: number) => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
};

/**
 * Clears the entire queue.
 * Used for hard resets or when queue is corrupted.
 */
export const clearQueue = async () => {
    const db = await getDB();
    await db.clear(STORE_NAME);
};