import { openDB } from 'idb';
const DB_NAME = 'worklin-offline-db';
const STORE_NAME = 'offline-queue';
let dbPromise = null;
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
export const addToQueue = async (operation) => {
    const db = await getDB();
    const op = {
        ...operation,
        timestamp: Date.now(),
    };
    await db.add(STORE_NAME, op);
    console.log('Operation added to offline queue:', op);
};
export const getQueue = async () => {
    const db = await getDB();
    return db.getAll(STORE_NAME);
};
export const removeFromQueue = async (id) => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
};
export const clearQueue = async () => {
    const db = await getDB();
    await db.clear(STORE_NAME);
};
