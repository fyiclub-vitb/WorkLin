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

// Register Service Worker (only in production).
// This enables offline caching + faster reloads, but we keep it out of dev to
// avoid stale caches while iterating.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
