import React, { useRef, useState } from 'react';
import { ImageIcon, Upload, X, Loader2, Trash2, Camera } from 'lucide-react';
// Adjusted path: goes up one level to src, then into lib
import { uploadImage } from '../lib/firebase/storage'; 
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
      
      if (error) throw new Error(error);
      if (downloadURL) {
        onUpdate(downloadURL);
        toast({
          title: "Cover updated",
          description: "Your page cover has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload the image. Please try again.",
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
        className="group relative h-12 w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1.5 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 backdrop-blur-sm shadow-sm"
              onClick={triggerUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              {isUploading ? 'Uploading...' : 'Add Cover'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="group relative w-full h-48 bg-gray-100 dark:bg-gray-800 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${url})` }}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={!editable || isUploading}
      />

      {editable && (isHovered || isUploading) && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10 animate-in fade-in duration-200">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs gap-1.5 bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-sm text-gray-700 dark:text-gray-200 border-0"
            onClick={triggerUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            Change Cover
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-xs gap-1.5 bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-sm text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 border-0"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};