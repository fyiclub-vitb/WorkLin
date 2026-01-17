const CACHE_NAME = 'worklin-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/styles/index.css',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Skip caching for Vite HMR and development files
    const url = new URL(event.request.url);
    if (url.pathname.includes('/node_modules/') || 
        url.pathname.includes('/@vite/') ||
        url.pathname.includes('/@react-refresh') ||
        url.searchParams.has('t') || // Vite cache busting
        url.pathname.endsWith('.tsx') ||
        url.pathname.endsWith('.ts')) {
        return; // Let browser handle these requests normally
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request).then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Fallback for document requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
