
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Vite Configuration File
 * 
 * Vite is the build tool and dev server for this project.
 * It's way faster than Create React App or webpack because it uses native ES modules.
 * 
 * This config file is pretty minimal because Vite has smart defaults.
 * We only need to specify a few things:
 * 1. Use the React plugin (for JSX support and Fast Refresh)
 * 2. Set the dev server port to 3000 instead of Vite's default 5173
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'WorkLin',
        short_name: 'WorkLin',
        description: 'Collaborative workspace for notes, tasks, and more.',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/, // cache external resources
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400,
              },
            },
          },
        ],
      },
      srcDir: 'public',
      filename: 'sw.js',
      strategies: 'generateSW',
      injectRegister: 'auto',
    }),
  ],
  server: {
    port: 3000,
  },
});
