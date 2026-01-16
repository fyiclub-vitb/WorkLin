import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  X, 
  FileText, 
  Home, 
  Star, 
  Trash2, 
  Moon, 
  Sun,
  BarChart2, // Added for Analytics icon
  RotateCcw, // Restore icon
  Trash // Permanent delete icon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../types/workspace';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '../hooks/use-toast';
import { useDarkMode } from '../hooks/useDarkMode';
import { IconPicker } from './ui/icon-picker';
import { usePageSearch } from '../hooks/use-page-search';
import { Logo } from './Logo';

interface SidebarProps {
  pages: Page[];
  archivedPages?: Page[];
  currentPageId: string | null;
  onSelectPage: (pageId: string | null) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onRestorePage?: (pageId: string) => void;
  onPermanentlyDeletePage?: (pageId: string) => void;
  onUpdatePage?: (pageId: string, newIcon: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span className="truncate">{text}</span>;
  }

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
  archivedPages = [],
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRestorePage,
  onPermanentlyDeletePage,
  onUpdatePage,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { toast } = useToast();
  const { isDark, toggleDarkMode } = useDarkMode();
  const { searchQuery, setSearchQuery, filteredPages, inputRef } = usePageSearch(pages);
  const navigate = useNavigate();
  const [showTrash, setShowTrash] = useState(false);

  const handleAddPage = () => {
    onAddPage();
    toast({
      title: "Page created",
      description: "A new page has been added to your workspace.",
      duration: 3000,
    });
  };

  const handleDeletePage = (pageId: string) => {
    onDeletePage(pageId);
    toast({
      title: "Page moved to trash",
      description: "The page has been moved to trash. You can restore it later.",
      duration: 3000,
      variant: "destructive",
    });
  };

  const handleRestorePage = (pageId: string) => {
    if (onRestorePage) {
      onRestorePage(pageId);
      toast({
        title: "Page restored",
        description: "The page has been restored from trash.",
        duration: 3000,
      });
    }
  };

  const handlePermanentlyDeletePage = (pageId: string) => {
    if (onPermanentlyDeletePage) {
      onPermanentlyDeletePage(pageId);
      toast({
        title: "Page permanently deleted",
        description: "The page has been permanently deleted.",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  const handleSettings = () => {
    navigate('/app/settings');
  };

  return (
    <>
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

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-gray-200/50 dark:border-slate-800/50 flex flex-col h-screen shadow-lg"
      >
        <div className="p-4 border-b border-gray-200/50 dark:border-slate-800/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-900">
          <Logo size={40} />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-3 space-y-2 border-b border-gray-200/50 dark:border-slate-800/50">
          <button
            onClick={handleAddPage}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-800 dark:hover:to-slate-800 rounded-xl transition-all group hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={16} className="text-white" />
            </div>
            <span>New Page</span>
          </button>
          <button
            onClick={() => inputRef.current?.focus()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-[1.02]"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Search size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
            <span>Search</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">⌘K</span>
          </button>
        </div>

        <div className="p-3 pb-3 border-b border-gray-200/50 dark:border-slate-800/50">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100 placeholder:text-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 pb-3 border-b border-gray-200/50 dark:border-slate-800/50">
          <div className="space-y-1">
            <button 
              onClick={() => {
                navigate('/app');
                // Clear current page selection when going home
                onSelectPage(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <Home size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <span>Home</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-[1.02]">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <Star size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <span>Favorites</span>
            </button>
            <button
              onClick={() => navigate('/app/search')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <Search size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <span>Advanced Search</span>
            </button>

            <button
              onClick={() => navigate('/app/analytics')}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <BarChart2 size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setShowTrash(!showTrash)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all hover:scale-[1.02] ${
                showTrash 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                showTrash 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-gray-100 dark:bg-slate-800'
              }`}>
                <Trash2 size={16} className={showTrash ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'} />
              </div>
              <span>Trash</span>
              {archivedPages.length > 0 && (
                <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                  {archivedPages.length}
                </span>
              )}
            </button>

          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="py-3">
            {showTrash ? (
              <>
                <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Trash ({archivedPages.length})
                </div>
                {archivedPages.length === 0 ? (
                  <div className="text-center py-12 px-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <Trash2 size={32} className="text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Trash is empty</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Deleted pages will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {archivedPages.map((page) => (
                      <motion.div
                        key={page.id}
                        whileHover={{ x: 2 }}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <span className="text-base flex-shrink-0 opacity-50">
                          {page.icon}
                        </span>
                        <span className="flex-1 text-sm font-medium truncate line-through opacity-60">
                          {page.title}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onRestorePage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestorePage(page.id);
                              }}
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-all text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                              title="Restore"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          {onPermanentlyDeletePage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePermanentlyDeletePage(page.id);
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Permanently delete"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="px-2 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {searchQuery ? 'Search Results' : 'Pages'}
                </div>
                {filteredPages.length === 0 ? (
              <div className="text-center py-12 px-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <FileText size={32} className="text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{searchQuery ? 'No pages found' : 'No pages yet'}</p>
                {!searchQuery && (
                  <button
                    onClick={handleAddPage}
                    className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Create your first page
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPages.map((page) => (
                  <motion.div
                    key={page.id}
                    whileHover={{ x: 2 }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${currentPageId === page.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    onClick={() => onSelectPage(page.id)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <IconPicker onChange={(icon) => onUpdatePage?.(page.id, icon)}>
                        <span className="text-base flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5 transition-colors cursor-pointer">
                          {page.icon}
                        </span>
                      </IconPicker>
                    </div>

                    <span className="flex-1 text-sm font-medium truncate">
                      <HighlightedText text={page.title} highlight={searchQuery} />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};