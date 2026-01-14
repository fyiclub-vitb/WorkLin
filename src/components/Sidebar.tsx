import React, { useState } from 'react';
import { Plus, Search, Settings, Menu, X, FileText, Home, Star, Trash2, Moon, Sun } from 'lucide-react';
import { Page } from '../types/workspace';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../hooks/useDarkMode';
// NEW CODE: Import the picker
import { IconPicker } from './ui/icon-picker';
import React from 'react';
import { Plus, Search, Settings, X, FileText, Home, Star, Trash2 } from 'lucide-react';
import { Page } from '../types/workspace';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageSearch } from '../hooks/use-page-search';

interface SidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  // NEW CODE: Added this prop to handle icon updates
  onUpdatePage?: (pageId: string, newIcon: string) => void; 
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Helper component for highlighting text
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span className="truncate">{text}</span>;
  }
  
  // Escape regex special characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  return (
    <span className="truncate">
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-gray-100 rounded-[2px] px-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUpdatePage, // Destructure the new prop
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark, toggleDarkMode } = useDarkMode();

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const { searchQuery, setSearchQuery, filteredPages, inputRef } = usePageSearch(pages);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#f7f6f3] dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen`}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">WorkLin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-2 space-y-1">
          <button
            onClick={onAddPage}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors group"
          >
            <Plus size={16} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400" />
            <span>New Page</span>
          </button>
          <button 
            onClick={() => inputRef.current?.focus()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <Search size={16} className="text-gray-500" />
            <span>Search</span>
            <span className="ml-auto text-xs text-gray-400">⌘K</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-2 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="px-2 pb-2">
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Home size={16} />
              <span>Home</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
              <Star size={16} />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="py-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {searchQuery ? 'Search Results' : 'Pages'}
            </div>
            {filteredPages.length === 0 ? (
              <div className="text-center py-8 px-2">
                <FileText size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {searchQuery ? 'No pages found' : 'No pages yet'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={onAddPage}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Create your first page
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredPages.map((page) => (
                  <motion.div
                    key={page.id}
                    whileHover={{ x: 2 }}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                      currentPageId === page.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => onSelectPage(page.id)}
                  >
                    {/* NEW CODE: Wrapped the icon in the IconPicker */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <IconPicker onChange={(icon) => onUpdatePage?.(page.id, icon)}>
                             <span className="text-base flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5 transition-colors cursor-pointer">
                                {page.icon}
                             </span>
                        </IconPicker>
                    </div>
                    {/* END NEW CODE */}
                    
                    <span className="flex-1 text-sm font-medium truncate">{page.title}</span>
                    <span className="text-base flex-shrink-0">{page.icon}</span>
                    <span className="flex-1 text-sm font-medium truncate">
                      <HighlightedText text={page.title} highlight={searchQuery} />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Delete page"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
