import React, { useRef, useState } from 'react';
import { ImageIcon, Upload, X, Loader2, Trash2, Camera } from 'lucide-react';
// Adjusted path: goes up one level to src, then into lib
import { uploadImage } from '../lib/storage/cloudinary'; 
import { cn } from '../lib/utils';
// Adjusted path: goes up one level to src, then into components/ui
import { Button } from '../components/ui/button'; 
// Adjusted path: goes up one level to src, then into hooks
import { useToast } from '../hooks/use-toast'; 

interface PageCoverProps {
  url?: string;
  pageId: string;
  workspaceId?: string;
  editable?: boolean;
  onUpdate: (url: string | null) => void;
}

export const PageCover: React.FC<PageCoverProps> = ({
  url,
  pageId,
  workspaceId = 'default',
  editable = true,
  onUpdate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { url: downloadURL, error } = await uploadImage(file, workspaceId);
      
      if (error) {
        console.error('Upload error:', error);
        // Check for specific error messages
        let errorMessage = error;
        if (error.includes('Cloudinary cloud name not configured')) {
          errorMessage = 'Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME to .env file.';
        } else if (error.includes('Upload preset')) {
          errorMessage = 'Cloudinary upload preset not configured. Please check your .env file.';
        } else if (error.includes('network') || error.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
      
      if (downloadURL) {
        onUpdate(downloadURL);
        toast({
          title: "Cover updated",
          description: "Your page cover has been updated successfully.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "No URL returned from upload. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      let errorMessage = error?.message || 'Could not upload the image. Please try again.';
      
      // Provide helpful error messages
      if (errorMessage.includes('Cloudinary')) {
        errorMessage = 'Cloudinary not configured. Please set up Cloudinary in your .env file.';
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onUpdate(null);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (!url) {
    return (
      <div 
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
          disabled={!editable || isUploading}
        />
        
        {editable && (
          <Button
            variant="secondary"
            size="sm"
            className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 sm:gap-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 backdrop-blur-sm shadow-md text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium"
            onClick={triggerUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Cover</span>
                <span className="sm:hidden">Cover</span>
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={!editable || isUploading}
      />

      {editable && (isHovered || isUploading) && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 sm:gap-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 backdrop-blur-sm shadow-md text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium"
            onClick={triggerUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden sm:inline">Uploading...</span>
              </>
            ) : (
              <>
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Change</span>
              </>
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="h-8 sm:h-9 px-2 sm:px-3 gap-1.5 sm:gap-2 bg-white/90 hover:bg-red-50 dark:bg-gray-800/90 dark:hover:bg-red-900/30 backdrop-blur-sm shadow-md text-red-600 dark:text-red-400 hover:text-red-700 border border-red-200 dark:border-red-800 text-xs sm:text-sm font-medium"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      )}
    </div>
  );
};