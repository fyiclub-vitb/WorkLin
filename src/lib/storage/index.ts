/**
 * Unified Storage Interface
 * Switch between storage providers easily
 * 
 * To use Cloudinary: import from './cloudinary'
 * To use Supabase: import from './supabase'
 * To use Firebase: import from '../firebase/storage'
 */

// Default to Cloudinary (recommended - largest free tier)
export * from './cloudinary';

// Uncomment to use Supabase instead:
// export * from './supabase';

// Uncomment to use Firebase Storage instead:
// export * from '../firebase/storage';

/**
 * Storage Provider Configuration
 * Set this in your .env file to switch providers
 */
export const getStorageProvider = (): 'cloudinary' | 'supabase' | 'firebase' => {
  const provider = import.meta.env.VITE_STORAGE_PROVIDER || 'cloudinary';
  return provider as 'cloudinary' | 'supabase' | 'firebase';
};
