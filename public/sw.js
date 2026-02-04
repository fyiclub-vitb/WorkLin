// Service Worker for offline caching, sync, and push notifications
// Enhanced for mobile PWA experience

// Cache version - increment this when you want to force a cache update
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `worklin-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `worklin-dynamic-${CACHE_VERSION}`;
const OFFLINE_SYNC_QUEUE = 'worklin-sync-queue';

// Static assets to cache on install (app shell)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.svg',
];

// API routes that support offline sync
const SYNC_ENDPOINTS = [
    '/api/pages',
    '/api/blocks',
    '/api/workspace',
];

// Maximum cache size for dynamic content
const MAX_DYNAMIC_CACHE_SIZE = 100;

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Cache installation failed:', err);
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - network-first with cache fallback strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests for caching (but handle sync separately)
    if (event.request.method !== 'GET') {
        // Queue offline mutations for background sync
        if (shouldSyncOffline(event.request)) {
            event.respondWith(handleOfflineMutation(event.request));
        }
        return;
    }

    // Skip external requests
    if (!url.origin.includes(self.location.origin)) {
        return;
    }

    // Skip development-related files
    if (isDevelopmentFile(url)) {
        return;
    }

    // For HTML requests, use network-first strategy
    if (event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // For API requests, use stale-while-revalidate
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(staleWhileRevalidate(event.request));
        return;
    }

    // For static assets, use cache-first
    event.respondWith(cacheFirst(event.request));
});

// Network-first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/');
        }
        throw error;
    }
}

// Cache-first strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            await trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        throw error;
    }
}

// Stale-while-revalidate strategy for API calls
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request)
        .then(async networkResponse => {
            if (networkResponse.ok) {
                const cache = await caches.open(DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(error => {
            console.error('[SW] Network fetch failed:', error);
            return cachedResponse;
        });

    return cachedResponse || fetchPromise;
}

// Check if file is development-related
function isDevelopmentFile(url) {
    return url.pathname.includes('/node_modules/') ||
        url.pathname.includes('/@vite/') ||
        url.pathname.includes('/@react-refresh') ||
        url.searchParams.has('t') ||
        url.pathname.endsWith('.tsx') ||
        url.pathname.endsWith('.ts');
}

// Check if request should be synced offline
function shouldSyncOffline(request) {
    const url = new URL(request.url);
    return SYNC_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

// Handle offline mutations via background sync
async function handleOfflineMutation(request) {
    try {
        const response = await fetch(request.clone());
        return response;
    } catch (error) {
        // Queue the request for later sync
        await queueForSync(request);

        return new Response(
            JSON.stringify({
                success: true,
                offline: true,
                message: 'Saved offline. Will sync when online.'
            }),
            {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Queue request for background sync
async function queueForSync(request) {
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();

    const syncData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: body,
        timestamp: Date.now(),
    };

    // Store in IndexedDB for persistence
    const db = await openSyncDB();
    const tx = db.transaction(OFFLINE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(OFFLINE_SYNC_QUEUE);
    await store.add(syncData);

    // Register for background sync
    if ('sync' in self.registration) {
        await self.registration.sync.register('worklinSync');
    }
}

// Open IndexedDB for sync queue
function openSyncDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('WorkLinOfflineSync', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(OFFLINE_SYNC_QUEUE)) {
                db.createObjectStore(OFFLINE_SYNC_QUEUE, {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        };
    });
}

// Background sync event handler
self.addEventListener('sync', (event) => {
    if (event.tag === 'worklinSync') {
        event.waitUntil(syncOfflineData());
    }
});

// Process queued sync requests
async function syncOfflineData() {
    console.log('[SW] Starting background sync...');

    const db = await openSyncDB();
    const tx = db.transaction(OFFLINE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(OFFLINE_SYNC_QUEUE);

    const allRequests = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    for (const syncData of allRequests) {
        try {
            const response = await fetch(syncData.url, {
                method: syncData.method,
                headers: syncData.headers,
                body: syncData.body,
            });

            if (response.ok) {
                // Remove from queue on success
                const deleteTx = db.transaction(OFFLINE_SYNC_QUEUE, 'readwrite');
                const deleteStore = deleteTx.objectStore(OFFLINE_SYNC_QUEUE);
                deleteStore.delete(syncData.id);

                // Notify clients about successful sync
                notifyClients({
                    type: 'SYNC_SUCCESS',
                    data: { url: syncData.url, timestamp: syncData.timestamp }
                });
            }
        } catch (error) {
            console.error('[SW] Failed to sync:', syncData.url, error);
        }
    }
}

// Trim cache to maximum size
async function trimCache(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > maxSize) {
        const keysToDelete = keys.slice(0, keys.length - maxSize);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
    }
}

// Notify all clients with a message
async function notifyClients(message) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage(message);
    });
}

// Push notification handler
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body || 'New notification from WorkLin',
        icon: '/logo.svg',
        badge: '/logo.svg',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
        },
        actions: data.actions || [
            { action: 'open', title: 'Open' },
            { action: 'dismiss', title: 'Dismiss' },
        ],
        tag: data.tag || 'worklin-notification',
        renotify: data.renotify || false,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'WorkLin', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if none found
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

// Periodic sync for keeping content fresh (when supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'worklin-content-sync') {
        event.waitUntil(syncContent());
    }
});

// Sync content in background
async function syncContent() {
    console.log('[SW] Periodic content sync...');

    // Prefetch important pages
    const cache = await caches.open(DYNAMIC_CACHE);

    try {
        const response = await fetch('/api/workspace');
        if (response.ok) {
            cache.put('/api/workspace', response);
        }
    } catch (error) {
        console.log('[SW] Periodic sync failed:', error);
    }
}

// Message handler for direct communication with clients
self.addEventListener('message', (event) => {
    const { type, payload } = event.data || {};

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_URLS':
            event.waitUntil(
                caches.open(DYNAMIC_CACHE)
                    .then(cache => cache.addAll(payload.urls))
            );
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.delete(DYNAMIC_CACHE)
            );
            break;

        case 'GET_SYNC_QUEUE':
            event.waitUntil(
                getSyncQueueForClient(event)
            );
            break;
    }
});

// Get sync queue for client
async function getSyncQueueForClient(event) {
    const db = await openSyncDB();
    const tx = db.transaction(OFFLINE_SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(OFFLINE_SYNC_QUEUE);

    const allRequests = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    event.source.postMessage({
        type: 'SYNC_QUEUE',
        data: allRequests,
    });
}

console.log('[SW] Service worker loaded');