/**
 * Supabase Storage Implementation
 * Free tier: 1 GB storage, 2 GB bandwidth/month
 * No credit card required!
 * 
 * Sign up: https://supabase.com
 */

import { createClient } from '@supabase/supabase-js';

interface UploadResult {
  url: string | null;
  error: string | null;
}

// Client is created on demand so we fail fast with a clear error when env vars
// aren't configured (instead of sprinkling checks across every call).
const getSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Storage bucket name
 * @param path - Folder path within bucket (we generate the filename)
 */
export const uploadFile = async (
  file: File,
  bucket: string = 'uploads',
  path: string
): Promise<UploadResult> => {
  try {
    const supabase = getSupabaseClient();
    
    // Generate a unique filename so users can upload the same name repeatedly.
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file
    // `upsert: false` prevents accidental overwrite if a collision ever happens.
    const { data: _data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      // We throw here to reuse the catch -> consistent `{ url: null, error }` return.
      throw error;
    }

    // Get public URL.
    // This assumes the bucket is configured for public access or has an RLS policy
    // that allows reads for anon users.
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (error: any) {
    console.error('Supabase upload error:', error);
    return { url: null, error: error.message || 'Upload failed' };
  }
};

/**
 * Upload image to workspace
 * @param file - Image file
 * @param workspaceId - Workspace ID
 */
export const uploadImage = async (
  file: File,
  workspaceId: string
): Promise<UploadResult> => {
  const path = `workspaces/${workspaceId}/images`;
  return uploadFile(file, 'uploads', path);
};

/**
 * Upload page cover image
 * @param file - Image file
 * @param pageId - Page ID
 * @param workspaceId - Workspace ID
 */
export const uploadPageCover = async (
  file: File,
  pageId: string,
  workspaceId: string
): Promise<UploadResult> => {
  const path = `workspaces/${workspaceId}/pages/${pageId}/covers`;
  return uploadFile(file, 'uploads', path);
};

/**
 * Upload user profile image
 * @param file - Image file
 * @param userId - User ID
 */
export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  const path = `users/${userId}/profile`;
  return uploadFile(file, 'uploads', path);
};

/**
 * Delete file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Supabase delete error:', error);
    return { success: false, error: error.message || 'Delete failed' };
  }
};
