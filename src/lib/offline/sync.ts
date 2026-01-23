import { getQueue, removeFromQueue, OfflineOperation } from './queue';
import { updatePage, createPage, deletePage } from '../firebase/pages';
import { updateBlock, createBlock, deleteBlock } from '../firebase/database';

// Simple single-flight lock.
// We don't want overlapping sync runs because it can double-apply ops or fight over
// queue removal.
let isSyncing = false;

/**
 * Replay queued offline operations against the backend.
 *
 * Notes:
 * - Operations are processed in insertion order.
 * - We stop on the first failure and keep the remaining ops for a later retry.
 *   (This avoids tearing through the queue when the auth/session/network state is bad.)
 */
export const syncOfflineChanges = async () => {
    if (isSyncing) return;

    const queue = await getQueue();
    if (queue.length === 0) return;

    isSyncing = true;
    console.log(`Starting sync of ${queue.length} offline operations...`);

    for (const op of queue) {
        try {
            await processOperation(op);
            if (op.id) await removeFromQueue(op.id);
        } catch (error) {
            console.error('Failed to sync operation:', op, error);
            // Some errors are “permanent” (bad IDs, missing permissions, etc.), but
            // detecting them reliably depends on provider error codes.
            // For now we keep the op and retry later.
            break;
        }
    }

    isSyncing = false;
    console.log('Sync completed.');
};

// Keep this switch aligned with `OfflineOperation['type']` in `queue.ts`.
// Payloads are intentionally lightweight and come from the offline wrappers in
// firebase modules.
async function processOperation(op: OfflineOperation) {
    const { type, payload } = op;

    switch (type) {
        case 'updatePage':
            await updatePage(payload.pageId, payload.data);
            break;
        case 'createPage':
            // NOTE: current createPage API only takes userId (it creates an untitled page).
            // If we later support offline page drafts, extend the payload + create call.
            await createPage(payload.userId);
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

// When the browser reports we’re back online, try to flush the queue.
// (If the app is open offline and then reconnects, this avoids needing a refresh.)
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('App is online. Triggering sync...');
        syncOfflineChanges();
    });
}
