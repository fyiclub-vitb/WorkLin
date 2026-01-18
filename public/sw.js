// Service Worker for offline caching and progressive web app functionality
// This allows WorkLin to work offline by caching important files

// Version name for the cache - change this when you want to force a cache update
const CACHE_NAME = 'worklin-v1';

// List of files to cache when the service worker is installed
// These are the essential files needed for the app to work
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/src/App.tsx',
    '/src/styles/index.css',
];

// Install event - runs when the service worker is first installed
// This is where we populate the cache with our essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        // Open the cache and add all our assets to it
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - runs when the service worker becomes active
// This is where we clean up old caches from previous versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                // Delete all caches that don't match our current cache name
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch event - runs every time the browser makes a request
// This is where we serve cached files when offline
self.addEventListener('fetch', (event) => {
    // Don't try to cache requests to other domains (like APIs)
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Skip caching for Vite development files
    // These files change frequently during development and shouldn't be cached
    const url = new URL(event.request.url);
    if (url.pathname.includes('/node_modules/') || 
        url.pathname.includes('/@vite/') ||
        url.pathname.includes('/@react-refresh') ||
        url.searchParams.has('t') ||  // Vite adds timestamps for cache busting
        url.pathname.endsWith('.tsx') ||
        url.pathname.endsWith('.ts')) {
        return;  // Let browser handle these normally without caching
    }

    event.respondWith(
        // First, try to find the request in our cache
        caches.match(event.request).then((response) => {
            // If we found it in cache, return the cached version
            if (response) {
                return response;
            }

            // If not in cache, fetch it from the network
            return fetch(event.request).then((response) => {
                // Make sure we got a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response because it can only be consumed once
                const responseToCache = response.clone();
                
                // Add this new response to the cache for future use
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                // Return the response to the browser
                return response;
            }).catch(() => {
                // If fetch fails (offline), try to serve the index page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});