import { useState, useEffect, useCallback } from 'react';

/**
 * useOfflineSync - Hook for managing offline data synchronization
 * 
 * Provides:
 * - Online/offline status tracking
 * - Pending changes count
 * - Manual sync trigger
 * - Sync status updates from service worker
 */

interface SyncQueueItem {
    id: number;
    url: string;
    method: string;
    timestamp: number;
}

interface OfflineSyncState {
    isOnline: boolean;
    pendingChanges: number;
    lastSyncTime: Date | null;
    isSyncing: boolean;
    syncQueue: SyncQueueItem[];
}

interface OfflineSyncActions {
    triggerSync: () => Promise<void>;
    clearQueue: () => Promise<void>;
    getQueuedRequests: () => Promise<SyncQueueItem[]>;
}

export function useOfflineSync(): [OfflineSyncState, OfflineSyncActions] {
    const [state, setState] = useState<OfflineSyncState>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        pendingChanges: 0,
        lastSyncTime: null,
        isSyncing: false,
        syncQueue: [],
    });

    // Update online status
    useEffect(() => {
        const handleOnline = () => {
            setState(prev => ({ ...prev, isOnline: true }));
            // Auto-trigger sync when coming back online
            if (state.pendingChanges > 0) {
                triggerSync();
            }
        };

        const handleOffline = () => {
            setState(prev => ({ ...prev, isOnline: false }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [state.pendingChanges]);

    // Listen for service worker messages
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data || {};

            switch (type) {
                case 'SYNC_SUCCESS':
                    setState(prev => ({
                        ...prev,
                        pendingChanges: Math.max(0, prev.pendingChanges - 1),
                        lastSyncTime: new Date(),
                    }));
                    break;

                case 'SYNC_QUEUE':
                    setState(prev => ({
                        ...prev,
                        syncQueue: data || [],
                        pendingChanges: data?.length || 0,
                    }));
                    break;

                case 'SYNC_STARTED':
                    setState(prev => ({ ...prev, isSyncing: true }));
                    break;

                case 'SYNC_COMPLETED':
                    setState(prev => ({
                        ...prev,
                        isSyncing: false,
                        lastSyncTime: new Date(),
                        pendingChanges: 0,
                    }));
                    break;
            }
        };

        navigator.serviceWorker?.addEventListener('message', handleMessage);

        return () => {
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
        };
    }, []);

    // Get initial queue status
    useEffect(() => {
        getQueuedRequests();
    }, []);

    // Trigger manual sync
    const triggerSync = useCallback(async () => {
        if (!state.isOnline || state.isSyncing) return;

        setState(prev => ({ ...prev, isSyncing: true }));

        try {
            // Request sync if supported
            if ('sync' in (navigator.serviceWorker?.ready || {})) {
                const registration = await navigator.serviceWorker.ready;
                await (registration as any).sync.register('worklinSync');
            }

            // Fallback: refresh the queue status
            await getQueuedRequests();

            setState(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: new Date(),
            }));
        } catch (error) {
            console.error('[OfflineSync] Sync failed:', error);
            setState(prev => ({ ...prev, isSyncing: false }));
        }
    }, [state.isOnline, state.isSyncing]);

    // Get queued requests from service worker
    const getQueuedRequests = useCallback(async (): Promise<SyncQueueItem[]> => {
        return new Promise((resolve) => {
            if (!navigator.serviceWorker?.controller) {
                resolve([]);
                return;
            }

            // Set up one-time listener for response
            const handleMessage = (event: MessageEvent) => {
                if (event.data?.type === 'SYNC_QUEUE') {
                    navigator.serviceWorker.removeEventListener('message', handleMessage);
                    const queue = event.data.data || [];
                    setState(prev => ({
                        ...prev,
                        syncQueue: queue,
                        pendingChanges: queue.length,
                    }));
                    resolve(queue);
                }
            };

            navigator.serviceWorker.addEventListener('message', handleMessage);

            // Request queue from service worker
            navigator.serviceWorker.controller.postMessage({ type: 'GET_SYNC_QUEUE' });

            // Timeout after 2 seconds
            setTimeout(() => {
                navigator.serviceWorker.removeEventListener('message', handleMessage);
                resolve([]);
            }, 2000);
        });
    }, []);

    // Clear the sync queue
    const clearQueue = useCallback(async () => {
        if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_QUEUE' });
        }
        setState(prev => ({
            ...prev,
            pendingChanges: 0,
            syncQueue: [],
        }));
    }, []);

    const actions: OfflineSyncActions = {
        triggerSync,
        clearQueue,
        getQueuedRequests,
    };

    return [state, actions];
}

/**
 * useNetworkStatus - Simple hook for just online/offline status
 */
export function useNetworkStatus(): boolean {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

export default useOfflineSync;
