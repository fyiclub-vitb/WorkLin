import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  // Plugins array - add functionality to Vite
  plugins: [
    react() // This plugin enables React features like JSX and Fast Refresh (hot reload)
  ],
  
  // Development server configuration
  server: {
    port: 3000, // Run dev server on port 3000 instead of the default 5173
                // This is more familiar for developers used to Create React App
  },
  
  // Note: Vite automatically handles:
  // - TypeScript compilation
  // - CSS processing (including Tailwind)
  // - Hot module replacement (HMR)
  // - Production builds with minification
  // - Asset optimization
  // 
  // You can add more config here if needed, like:
  // - Custom aliases for imports
  // - Environment variable prefixes
  // - Build output directory
  // - Proxy settings for API calls
})