/**
 * Unified Storage Interface
 *
 * This file is intentionally a "barrel": it decides which implementation we
 * export as the default storage API for the app.
 *
 * Important: `export * from ...` is resolved at build time.
 * Calling `getStorageProvider()` does NOT automatically switch the exported
 * functions at runtime; it’s just a helper for UI/config screens.
 */

// Default to Cloudinary (recommended - largest free tier)
export * from './cloudinary';

// Uncomment to use Supabase instead:
// export * from './supabase';

// Uncomment to use Firebase Storage instead:
// export * from '../firebase/storage';

/**
 * Storage Provider Configuration
 *
 * VITE_STORAGE_PROVIDER is mainly used for showing/validating configuration in
 * the UI. Switching providers still requires changing the export above.
 */
export const getStorageProvider = (): 'cloudinary' | 'supabase' | 'firebase' => {
  const provider = import.meta.env.VITE_STORAGE_PROVIDER || 'cloudinary';
  return provider as 'cloudinary' | 'supabase' | 'firebase';
};
