import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Trash2, Clock, FileText } from 'lucide-react';
import { updatePage, deletePage } from '../lib/firebase/pages';
import { useNavigate } from 'react-router-dom';

import { Page } from '../types/workspace';
import { saveCustomTemplate } from '../lib/templates';
import { useToast } from '../hooks/use-toast';
import { Save } from 'lucide-react';

interface PageHeaderProps {
  page: Page;
  initialTitle: string;
  onDelete?: () => void; // Callback to clear local state if needed
}

export const PageHeader: React.FC<PageHeaderProps> = ({ page, initialTitle, onDelete }) => {
  const [title, setTitle] = useState(initialTitle);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync local state if props change (e.g. loading a different page)
  useEffect(() => {
    setTitle(initialTitle || 'Untitled Page');
  }, [initialTitle]);

  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce save for title (Wait 500ms after typing stops to save)
  useEffect(() => {
    if (title === initialTitle) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      await updatePage(page.id, { title });
      setIsSaving(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, page.id]); // Note: removed initialTitle from dependency to prevent loop

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this page permanently?')) {
      await deletePage(page.id);
      if (onDelete) onDelete();
      navigate('/'); // Go back home after delete
    }
  };

  return (
    <div className="group relative mb-4">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between h-8 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Left side (Add icon/cover buttons if you want them later) */}
        <div className="flex gap-2">
          {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>

        {/* Right side: The Three Dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Page Options
              </div>
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                onClick={() => {
                  // Add "Copy Link" logic here later
                  setShowMenu(false);
                }}
              >
                <FileText size={14} />
                Copy Link
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
              <button
                onClick={() => {
                  saveCustomTemplate({
                    name: title || 'Untitled Template',
                    description: 'Saved from page',
                    icon: page.icon || '📄',
                    content: {
                      title: title,
                      blocks: page.blocks,
                    }
                  });
                  toast({
                    title: "Template Saved",
                    description: "You can find it in the Custom category.",
                  });
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <Save size={14} />
                Save as Template
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
              <button
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Page
              </button>
              <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 mt-1">
                Last edited today
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title Input */}
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Page"
          className="w-full text-4xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 px-0"
        />
      </div>
    </div>
  );
};