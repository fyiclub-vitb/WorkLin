/**
 * Firebase Storage Module - DEPRECATED
 * 
 * ⚠️ IMPORTANT: This file is kept for reference only and will NOT work!
 * 
 * WHY IT'S DEPRECATED:
 * Firebase Storage requires a paid Blaze plan (pay-as-you-go) to use in production.
 * The free Spark plan only allows 5GB storage and 1GB/day bandwidth, which is
 * insufficient for a production app with multiple users uploading images.
 * 
 * WHAT WE USE INSTEAD:
 * We've migrated to Cloudinary, which offers:
 * - ✅ 25 GB storage (FREE forever)
 * - ✅ 25 GB bandwidth/month (FREE)
 * - ✅ Image transformations (resize, crop, optimize) built-in
 * - ✅ CDN included for fast global delivery
 * - ✅ No credit card required
 * 
 * HOW TO USE CLOUDINARY:
 * Import from: src/lib/storage/cloudinary.ts
 * 
 * Example:
 * ```typescript
 * import { uploadImage } from '../storage/cloudinary';
 * const { url, error } = await uploadImage(file, workspaceId);
 * ```
 * 
 * SETUP GUIDE:
 * See MIGRATE_TO_CLOUDINARY.md for 5-minute setup instructions
 * 
 * HISTORICAL REFERENCE:
 * This file shows how Firebase Storage was originally implemented.
 * It's commented out to prevent accidental usage but kept for reference.
 */

/*
// ============================================================================
// ORIGINAL FIREBASE STORAGE IMPLEMENTATION (DEPRECATED)
// ============================================================================
// 
// The code below shows how we originally used Firebase Storage before
// migrating to Cloudinary. This is kept as reference for understanding
// the migration or if you want to use Firebase Storage in your own fork.
//
// To use this code:
// 1. Uncomment the imports and functions below
// 2. Enable Firebase Storage in your Firebase Console
// 3. Upgrade to Blaze plan (billing enabled)
// 4. Import 'storage' from './config' (currently removed)
// ============================================================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config'; // ⚠️ This import is removed - storage not configured

/**
 * Upload a file to Firebase Storage
 * 
 * @param file - The file to upload (File object from input[type="file"])
 * @param path - Storage path (e.g., 'workspaces/workspace-id/images/image.jpg')
 * @returns Object with download URL or error message
 * 
 * USAGE:
 * ```typescript
 * const { url, error } = await uploadFile(myFile, 'users/user-123/avatar.jpg');
 * if (error) {
 *   console.error('Upload failed:', error);
 * } else {
 *   console.log('File uploaded:', url);
 * }
 * ```
 * 
 * FIREBASE STORAGE STRUCTURE:
 * workspaces/
 *   ├── {workspaceId}/
 *   │   ├── images/
 *   │   │   └── {timestamp}_{filename}
 *   │   └── pages/
 *   │       └── {pageId}/
 *   │           └── covers/
 *   │               └── {filename}
 *   └── users/
 *       └── {userId}/
 *           └── profile/
 *               └── avatar.jpg
 * /
export const uploadFile = async (file: File, path: string) => {
  try {
    // Create a storage reference at the specified path
    const storageRef = ref(storage, path);
    
    // Upload the file bytes to Firebase Storage
    // This returns a snapshot with metadata about the upload
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the publicly accessible download URL
    // This URL can be used in <img> tags or saved to Firestore
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { url: downloadURL, error: null };
  } catch (error: any) {
    // Handle common Firebase Storage errors:
    // - storage/unauthorized: User doesn't have permission
    // - storage/canceled: Upload was cancelled
    // - storage/quota-exceeded: Storage quota exceeded
    // - storage/unknown: Unknown error occurred
    
    console.error('Firebase Storage upload error:', error);
    return { url: null, error: error.message };
  }
};

/**
 * Upload an image with auto-generated path
 * 
 * Automatically creates a path based on:
 * - Workspace ID
 * - Current timestamp (prevents filename conflicts)
 * - Original filename
 * 
 * @param file - Image file to upload
 * @param workspaceId - ID of the workspace (for organizing files)
 * @returns Object with download URL or error
 * 
 * EXAMPLE PATH GENERATED:
 * workspaces/workspace-abc123/images/1704067200000_screenshot.png
 *                           └── timestamp ──┘ └── original filename ──┘
 * /
export const uploadImage = async (file: File, workspaceId: string) => {
  // Generate timestamped filename to prevent conflicts
  // Format: {timestamp}_{originalFilename}
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  
  // Create hierarchical path: workspaces/{id}/images/{filename}
  const path = `workspaces/${workspaceId}/images/${filename}`;
  
  return uploadFile(file, path);
};

/**
 * Delete a file from Firebase Storage
 * 
 * @param path - Full storage path of the file to delete
 * @returns Object with error (null if successful)
 * 
 * USAGE:
 * ```typescript
 * const { error } = await deleteFile('workspaces/abc123/images/old-image.jpg');
 * if (error) {
 *   console.error('Delete failed:', error);
 * } else {
 *   console.log('File deleted successfully');
 * }
 * ```
 * 
 * IMPORTANT: This deletes the file permanently and cannot be undone!
 * 
 * COMMON ERRORS:
 * - storage/object-not-found: File doesn't exist at this path
 * - storage/unauthorized: User doesn't have delete permission
 * /
export const deleteFile = async (path: string) => {
  try {
    // Create a reference to the file to delete
    const storageRef = ref(storage, path);
    
    // Delete the file from Firebase Storage
    // This is a permanent operation - no undo!
    await deleteObject(storageRef);
    
    return { error: null };
  } catch (error: any) {
    console.error('Firebase Storage delete error:', error);
    return { error: error.message };
  }
};

// ============================================================================
// END OF DEPRECATED CODE
// ============================================================================
*/

/**
 * MIGRATION GUIDE: Firebase Storage → Cloudinary
 * 
 * If you're currently using Firebase Storage and want to migrate:
 * 
 * 1. SETUP CLOUDINARY (5 minutes):
 *    - Sign up at https://cloudinary.com/users/register/free
 *    - Get your Cloud Name, API Key, API Secret
 *    - Create upload preset named 'worklin_upload'
 *    - Add credentials to .env file
 * 
 * 2. UPDATE YOUR CODE:
 *    Old:
 *    ```typescript
 *    import { uploadImage } from '../lib/firebase/storage';
 *    ```
 *    
 *    New:
 *    ```typescript
 *    import { uploadImage } from '../lib/storage/cloudinary';
 *    ```
 *    
 *    The API is identical - no other changes needed!
 * 
 * 3. MIGRATE EXISTING FILES (Optional):
 *    If you have files already in Firebase Storage, you can:
 *    - Download them from Firebase Console
 *    - Re-upload to Cloudinary via their UI or API
 *    - Update URLs in your Firestore database
 * 
 * 4. DISABLE FIREBASE STORAGE:
 *    - You can disable Firebase Storage in Firebase Console
 *    - This will save you from accidental billing if you upgrade
 * 
 * For detailed migration guide, see: MIGRATE_TO_CLOUDINARY.md
 */

// Export empty object to maintain module structure
export {};