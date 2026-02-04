import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// App entrypoint.
//
// We initialize Firebase once at startup so any screens/hooks that depend on it
// can assume the SDK is ready.
import app from './firebase'
console.log("Firebase connected:", app);

// Store service worker registration globally for update notifications
declare global {
  interface Window {
    swRegistration?: ServiceWorkerRegistration;
  }
}

// Register Service Worker for PWA functionality.
// Enables offline caching, background sync, and push notifications.
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return;
  }

  // Only register in production, or if explicitly enabled
  if (!import.meta.env.PROD && !import.meta.env.VITE_ENABLE_SW) {
    console.log('[SW] Skipping service worker registration in development');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('[SW] Service worker registered:', registration);
    window.swRegistration = registration;

    // Check for updates immediately
    registration.update();

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
    }, 1000 * 60 * 60);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready, dispatch custom event
          window.dispatchEvent(new CustomEvent('swUpdate', {
            detail: { registration }
          }));
          console.log('[SW] New version available');
        }
      });
    });

    // Handle controller change (after skipWaiting)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading...');
      window.location.reload();
    });

  } catch (error) {
    console.error('[SW] Service worker registration failed:', error);
  }
}

// Request notification permission for push notifications
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[Notifications] Not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    console.log('[Notifications] Already granted');
    return;
  }

  if (Notification.permission !== 'denied') {
    // We'll request permission when user interacts with the app
    // Don't request immediately on page load (bad UX)
    console.log('[Notifications] Permission can be requested');
  }
}

// Initialize the app
window.addEventListener('load', () => {
  registerServiceWorker();
  requestNotificationPermission();
});

// Render the React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
