import React, { useState, useEffect } from 'react';
import { Block as BlockType } from '../../types/workspace';
import { Link, Video, Twitter, Image as ImageIcon, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface EmbedBlockProps {
  block: BlockType;
  onUpdate: (updates: Partial<BlockType>) => void;
}

type EmbedType = 'youtube' | 'twitter' | 'generic' | 'image' | 'vimeo';

interface EmbedData {
  url: string;
  type: EmbedType;
  embedUrl?: string;
  title?: string;
  thumbnail?: string;
  videoId?: string;
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({ block, onUpdate }) => {
  const [url, setUrl] = useState(block.properties?.url || '');
  const [embedData, setEmbedData] = useState<EmbedData | null>(
    block.properties?.embedData || null
  );
  const [isEditing, setIsEditing] = useState(!block.properties?.url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Twitter widget script if needed
    if (embedData?.type === 'twitter' ) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [embedData]);

  const detectEmbedType = (inputUrl: string): EmbedData | null => {
    try {
      const urlObj = new URL(inputUrl.trim());
      
      // YouTube detection
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        let videoId = '';
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1).split('?')[0];
        } else if (urlObj.searchParams.has('v')) {
          videoId = urlObj.searchParams.get('v') || '';
        } else {
          // Handle /embed/ URLs
          const match = urlObj.pathname.match(/\/embed\/([^/?]+)/);
          if (match) videoId = match[1];
        }
        
        if (videoId) {
          return {
            url: inputUrl,
            type: 'youtube',
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            videoId,
          };
        }
      }
      
      // Vimeo detection
      if (urlObj.hostname.includes('vimeo.com')) {
        const videoId = urlObj.pathname.split('/').filter(Boolean)[0];
        if (videoId) {
          return {
            url: inputUrl,
            type: 'vimeo',
            embedUrl: `https://player.vimeo.com/video/${videoId}`,
            videoId,
          };
        }
      }
      
      // Twitter/X detection
      if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
        return {
          url: inputUrl,
          type: 'twitter',
          embedUrl: inputUrl,
        };
      }

      // Image detection - check for image extensions
      const pathname = urlObj.pathname.toLowerCase();
      if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(pathname)) {
        return {
          url: inputUrl,
          type: 'image',
          embedUrl: inputUrl,
        };
      }

      // Check if URL looks like an image by content-type (we'll show a preview attempt)
      if (urlObj.hostname.includes('imgur.com') || 
          urlObj.hostname.includes('giphy.com') ||
          urlObj.hostname.includes('unsplash.com')) {
        return {
          url: inputUrl,
          type: 'image',
          embedUrl: inputUrl,
        };
      }

      // Generic embed for other URLs
      return {
        url: inputUrl,
        type: 'generic',
        embedUrl: inputUrl,
      };
    } catch (err) {
      return null;
    }
  };

  const handleEmbed = () => {
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    // Add https:// if no protocol specified
    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      finalUrl = 'https://' + trimmedUrl;
    }

    setLoading(true);
    setError('');

    const data = detectEmbedType(finalUrl);
    
    if (!data) {
      setError('Invalid URL. Please enter a valid URL.');
      setLoading(false);
      return;
    }

    setEmbedData(data);
    onUpdate({
      text: finalUrl,
      content: finalUrl,
      properties: { ...block.properties, url: finalUrl, embedData: data }
    });
    setIsEditing(false);
    setLoading(false);
  };

  const renderEmbed = () => {
    if (!embedData) return null;

    switch (embedData.type) {
      case 'youtube':
        return (
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedData.embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="YouTube video embed"
              loading="lazy"
            />
          </div>
        );

      case 'vimeo':
        return (
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedData.embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video embed"
              loading="lazy"
            />
          </div>
        );

      case 'twitter':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Twitter size={48} className="mb-4 text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
              Twitter/X Embed Preview
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 text-center max-w-md">
              Twitter embeds are displayed on the published page. Click the link below to view the tweet.
            </p>
            <a
              href={embedData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              View on Twitter
              <ExternalLink size={14} />
            </a>
          </div>
        );

      case 'image':
        return (
          <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={embedData.embedUrl}
              alt="Embedded image"
              className="w-full h-auto max-h-[600px] object-contain"
              loading="lazy"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex flex-col items-center justify-center p-8 text-gray-500">
                      <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="text-sm">Failed to load image</p>
                      <a href="${embedData.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-xs mt-2">View original</a>
                    </div>
                  `;
                }
              }}
            />
          </div>
        );

      case 'generic':
        return (
          <div className="space-y-3">
            <div className="relative w-full border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
              <iframe
                src={embedData.embedUrl}
                className="w-full h-96"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                title="Generic embed"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>Generic embed - some features may be limited</span>
              <a
                href={embedData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open in new tab
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getIcon = () => {
    if (!embedData) return <Link size={16} className="text-gray-500" />;
    
    switch (embedData.type) {
      case 'youtube':
      case 'vimeo':
        return <Video size={16} className="text-red-500" />;
      case 'twitter':
        return <Twitter size={16} className="text-blue-400" />;
      case 'image':
        return <ImageIcon size={16} className="text-green-500" />;
      default:
        return <Link size={16} className="text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    if (!embedData) return 'Embed';
    
    switch (embedData.type) {
      case 'youtube':
        return 'YouTube Video';
      case 'vimeo':
        return 'Vimeo Video';
      case 'twitter':
        return 'Twitter/X Post';
      case 'image':
        return 'Image';
      case 'generic':
        return 'Web Embed';
      default:
        return 'Embed';
    }
  };

  return (
    <div className="group relative p-4 border-2 border-blue-200 dark:border-blue-900/50 rounded-lg bg-blue-50/30 dark:bg-blue-900/10">
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {getTypeLabel()}
        </span>
        {embedData && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Change URL
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Vimeo, Twitter, image URL, or any web link..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleEmbed();
                }
              }}
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleEmbed}
              disabled={loading || !url.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md text-sm transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Embed
            </button>
            {embedData && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUrl(block.properties?.url || '');
                  setError('');
                }}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p className="font-medium">Supported platforms:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>YouTube & Vimeo videos</li>
              <li>Twitter/X posts</li>
              <li>Images (jpg, png, gif, webp, svg)</li>
              <li>Any website (via iframe)</li>
            </ul>
          </div>
        </div>
      ) : embedData ? (
        <div className="space-y-2">
          {renderEmbed()}
          <div className="flex items-center justify-between pt-2">
            <a
              href={embedData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate max-w-[80%]"
              title={embedData.url}
            >
              {embedData.url}
            </a>
            <a
              href={embedData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Open
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
          Click "Change URL" or paste a link to embed content
        </div>
      )}
    </div>
  );
};