import { getQueue, removeFromQueue, OfflineOperation } from './queue';
import { updatePage, createPage, deletePage } from '../firebase/pages';
import { updateBlock, createBlock, deleteBlock } from '../firebase/database';

// Unique identifier per browser tab (used only for debugging/testing)
const TAB_ID = crypto.randomUUID();

// Simple single-flight lock.
// Intended to prevent overlapping sync runs in the same tab.
let isSyncing = false;

/**
 * Replay queued offline operations against the backend.
 *
 * Notes:
 * - Operations are processed in insertion order.
 * - We stop on the first failure and keep remaining ops for retry.
 * - This version includes logging to detect concurrent sync executions.
 */
export const syncOfflineChanges = async () => {
    const syncRunId = crypto.randomUUID();

    console.log(
        `[SYNC ATTEMPT] tab=${TAB_ID} run=${syncRunId} isSyncing=${isSyncing}`
    );

    if (isSyncing) {
        console.log(
            `[SYNC BLOCKED] tab=${TAB_ID} run=${syncRunId}`
        );
        return;
    }

    const queue = await getQueue();
    if (queue.length === 0) {
        console.log(
            `[SYNC ABORT] tab=${TAB_ID} run=${syncRunId} queue empty`
        );
        return;
    }

    isSyncing = true;

    console.log(
        `[SYNC START] tab=${TAB_ID} run=${syncRunId} ops=${queue.length}`
    );

    for (const op of queue) {
        try {
            console.log(
                `[OP APPLY] tab=${TAB_ID} run=${syncRunId} opId=${op.id} type=${op.type}`
            );

            await processOperation(op);

            if (op.id) {
                await removeFromQueue(op.id);
                console.log(
                    `[OP REMOVED] tab=${TAB_ID} run=${syncRunId} opId=${op.id}`
                );
            }
        } catch (error) {
            console.error(
                `[SYNC FAIL] tab=${TAB_ID} run=${syncRunId} op=${op}`,
                error
            );
            break;
        }
    }

    isSyncing = false;

    console.log(
        `[SYNC END] tab=${TAB_ID} run=${syncRunId}`
    );
};

/**
 * Apply a single offline operation to the backend.
 * Must stay aligned with OfflineOperation['type'].
 */
async function processOperation(op: OfflineOperation) {
    const { type, payload } = op;

    switch (type) {
        case 'updatePage':
            await updatePage(payload.pageId, payload.data);
            break;

        case 'createPage':
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
            console.warn(
                `[UNKNOWN OP] tab=${TAB_ID} type=${type}`
            );
    }
}

// Trigger sync when browser comes back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log(
            `[ONLINE EVENT] tab=${TAB_ID} triggering sync`
        );
        syncOfflineChanges();
    });
}
