/**
 * Cloudinary Storage Implementation
 * Free tier: 25 GB storage, 25 GB bandwidth/month
 * No credit card required!
 * 
 * Sign up: https://cloudinary.com/users/register/free
 */

interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Upload file to Cloudinary
 * @param file - File to upload
 * @param folder - Folder path (e.g., 'workspaces/workspaceId/images')
 * @param options - Additional Cloudinary options
 */
export const uploadFile = async (
  file: File,
  folder: string = 'uploads',
  options?: {
    transformation?: string;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<UploadResult> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);
    
    if (options?.publicId) {
      formData.append('public_id', options.publicId);
    }
    
    // Defensive: ensure we do NOT send a 'transformation' parameter in the form data.
    // Cloudinary will return 400 for unsigned uploads if 'transformation' is present.
    if (formData.has('transformation')) {
      formData.delete('transformation');
    }
    // Prevent resource_type being incorrectly set by third-party code
    if (formData.has('resource_type')) {
      formData.delete('resource_type');
    }
    if (options?.transformation) {
      // We will apply transformation via URL after upload (unsigned uploads disallow sending it).
      // eslint-disable-next-line no-console
      console.warn('Cloudinary: not sending transformation in upload request for unsigned preset; applying via URL after upload.');
    }

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${
        options?.resourceType === 'video' ? 'video' : 'image'
      }/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        // try JSON first, fallback to text so we see full server message
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error?.message || error.message || JSON.stringify(error) || 'Upload failed';
        } else {
          const text = await response.text();
          errorMessage = text || `Upload failed with status ${response.status}`;
        }
        
        // Provide helpful error messages
        if (errorMessage.includes('Invalid upload preset')) {
          errorMessage = 'Invalid upload preset. Please check VITE_CLOUDINARY_UPLOAD_PRESET in .env';
        } else if (errorMessage.includes('Unauthorized')) {
          errorMessage = 'Unauthorized. Please check your Cloudinary credentials.';
        } else if (errorMessage.includes('Transformation parameter is not allowed')) {
          errorMessage = 'Cloudinary rejected a transformation parameter on an unsigned upload. Remove transformation from upload or use signed uploads.';
        }
      } catch (parseError) {
        errorMessage = `Upload failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let url = data.secure_url;
    
    // Apply transformation via URL if provided (since we can't use transformation param with unsigned uploads)
    if (options?.transformation && url) {
      // Insert transformation into URL: replace /upload/ with /upload/{transformation}/
      url = url.replace('/upload/', `/upload/${options.transformation}/`);
    }
    
    return { url, error: null };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    let errorMessage = error.message || 'Upload failed';
    
    // Provide helpful error messages for common issues
    if (errorMessage.includes('Cloudinary cloud name not configured')) {
      errorMessage = 'Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env file. See QUICK_STORAGE_SETUP.md for setup instructions.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    return { url: null, error: errorMessage };
  }
};

/**
 * Upload image with automatic optimization
 * @param file - Image file
 * @param workspaceId - Workspace ID for folder organization
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 */
export const uploadImage = async (
  file: File,
  workspaceId: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<UploadResult> => {
  const folder = `workspaces/${workspaceId}/images`;
  const transformation = `w_${maxWidth},h_${maxHeight},c_limit,q_auto,f_auto`;
  
  return uploadFile(file, folder, {
    transformation,
    resourceType: 'image',
  });
};

/**
 * Upload page cover image (optimized for covers)
 * @param file - Image file
 * @param pageId - Page ID
 * @param workspaceId - Workspace ID
 */
export const uploadPageCover = async (
  file: File,
  pageId: string,
  workspaceId: string
): Promise<UploadResult> => {
  const folder = `workspaces/${workspaceId}/pages/${pageId}/covers`;
  // Cover images: 2000x600 max, auto quality, auto format
  const transformation = 'w_2000,h_600,c_fill,q_auto,f_auto';
  
  return uploadFile(file, folder, {
    transformation,
    resourceType: 'image',
    publicId: `cover_${Date.now()}`,
  });
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
  const folder = `users/${userId}/profile`;
  // Profile images: 400x400, circular crop, auto quality
  const transformation = 'w_400,h_400,c_fill,g_face,q_auto,f_auto';
  
  return uploadFile(file, folder, {
    transformation,
    resourceType: 'image',
    publicId: 'avatar',
  });
};

/**
 * Delete file from Cloudinary
 * @param url - Full Cloudinary URL or public ID
 */
export const deleteFile = async (url: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured for deletion');
    }

    // Extract public_id from URL
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
    const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (!publicIdMatch) {
      throw new Error('Invalid Cloudinary URL');
    }

    const publicId = publicIdMatch[1];
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature (simplified - for production, do this server-side)
    // Note: For production, use a backend API to handle deletion securely
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          // In production, generate signature on backend
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Delete failed');
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message || 'Delete failed' };
  }
};

/**
 * Get optimized image URL (resize on-the-fly)
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height (optional)
 * @param crop - Crop mode (default: 'limit')
 */
export const getOptimizedImageUrl = (
  url: string,
  width: number,
  height?: number,
  crop: 'limit' | 'fill' | 'fit' | 'scale' = 'limit'
): string => {
  if (!url.includes('cloudinary.com')) {
    return url; // Not a Cloudinary URL, return as-is
  }

  // Insert transformation into URL
  const transformation = height 
    ? `w_${width},h_${height},c_${crop},q_auto,f_auto`
    : `w_${width},c_${crop},q_auto,f_auto`;

  return url.replace('/upload/', `/upload/${transformation}/`);
};
