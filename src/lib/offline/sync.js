import { getQueue, removeFromQueue } from './queue';
import { updatePage, createPage, deletePage } from '../firebase/pages';
import { updateBlock, createBlock, deleteBlock } from '../firebase/database';
let isSyncing = false;
export const syncOfflineChanges = async () => {
    if (isSyncing)
        return;
    const queue = await getQueue();
    if (queue.length === 0)
        return;
    isSyncing = true;
    console.log(`Starting sync of ${queue.length} offline operations...`);
    for (const op of queue) {
        try {
            await processOperation(op);
            if (op.id)
                await removeFromQueue(op.id);
        }
        catch (error) {
            console.error('Failed to sync operation:', op, error);
            // If it's a permanent error (e.g. 404), we might want to remove it anyway
            // For now, we'll keep it in the queue and retry later
            break;
        }
    }
    isSyncing = false;
    console.log('Sync completed.');
};
async function processOperation(op) {
    const { type, payload } = op;
    switch (type) {
        case 'updatePage':
            await updatePage(payload.pageId, payload.data);
            break;
        case 'createPage':
            await createPage(payload.userId); // This might need refinement for payload
            break;
        case 'deletePage':
            await deletePage(payload.pageId);
            break;
        case 'updateBlock':
            await updateBlock(payload.blockId, payload.updates);
            break;
        case 'createBlock':
            await createBlock(payload.pageId, payload.blockData);
            break;
        case 'deleteBlock':
            await deleteBlock(payload.blockId);
            break;
        default:
            console.warn('Unknown operation type:', type);
    }
}
// Set up online listener
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('App is online. Triggering sync...');
        syncOfflineChanges();
    });
}
