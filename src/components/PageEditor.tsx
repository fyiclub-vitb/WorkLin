// src/components/PageEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Page, BlockType, Block } from '../types/workspace';
import { Block as BlockComponent } from './Block';
import { Plus, History, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageProperties } from './PageProperties';
import { PageCover } from '../pages/PageCover';
import { LogoIcon } from './Logo';

import { CollaborationProvider } from './collaboration/CollaborationProvider';
import { useToast } from '../hooks/use-toast';
import { ExportMenu } from "./page/ExportMenu";
import { VersionHistory } from "./VersionHistory";
import { TableView } from './views/TableView';
import { BoardView } from './views/BoardView';
import { CalendarView } from './views/CalendarView';

import { ViewType, ViewDefinition } from '../types/view';
import { getPagesByParent, updatePage, createPage } from '../lib/firebase/database';

// Database Property Imports
import { RelationProperty } from './database/RelationProperty';
import { RollupProperty } from './database/RollupProperty';
import { FormulaProperty } from './database/FormulaProperty';
import { DatabaseProperty, RelationProperty as RelationType, RollupProperty as RollupType, FormulaProperty as FormulaType } from '../types/database';

interface PageEditorProps {
  page: Page | undefined;
  allPages: Page[]; // FIX: Change workspace to allPages array
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageCover: (url: string) => void;
  onUpdatePage?: (pageId: string, updates: Partial<Page>) => void;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  allPages, // FIX: Use allPages instead of workspace
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onUpdatePageTitle,
  onUpdatePageCover,
  onUpdatePage,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewDefinition | null>(null);
  const [databasePages, setDatabasePages] = useState<Page[]>([]);
  const [isLoadingViews, setIsLoadingViews] = useState(false);

  // Initialize view from page settings
  useEffect(() => {
    if (page?.lastActiveViewId && page.views) {
      const savedView = page.views.find(v => v.id === page.lastActiveViewId);
      if (savedView) setCurrentView(savedView);
    }
  }, [page?.id]); // Only reset on page change, avoid loop

  // Fetch child pages when in a database view
  useEffect(() => {
    if (currentView && page) {
      setIsLoadingViews(true);
      getPagesByParent(page.id).then(({ pages }) => {
        setDatabasePages(pages);
        setIsLoadingViews(false);
      });
    }
  }, [currentView, page?.id]);

  const handleSwitchView = async (type: ViewType) => {
    if (!page) return;

    // Check if view already exists
    let newView = page.views?.find(v => v.type === type);
    let updatedViews = page.views || [];

    if (!newView) {
      newView = {
        id: crypto.randomUUID(),
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type: type
      };
      updatedViews = [...updatedViews, newView];
    }

    // Optimistic update
    setCurrentView(newView);

    // Persist
    try {
      const result = await updatePage(page.id, {
        views: updatedViews,
        lastActiveViewId: newView.id
      });
      if (result.error) {
        console.error('Failed to persist view:', result.error);
        toast({
          title: "Error saving view",
          description: "Your view preference couldn't be saved.",
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('Exception persisting view:', e);
    }
  };

  const handleClearView = async () => {
    if (!page) return;
    setCurrentView(null);
    await updatePage(page.id, { lastActiveViewId: undefined });
  }

  const { toast } = useToast();

  useEffect(() => {
    if (isTitleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isTitleEditing]);

  const handleAddBlock = (type: BlockType) => {
    onAddBlock(type);
    toast({
      title: "Block created",
      description: "A new block has been added to the page.",
      duration: 3000,
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    onDeleteBlock(blockId);
    toast({
      title: "Block deleted",
      description: "The block has been removed.",
      duration: 3000,
    });
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    onUpdateBlock(blockId, updates);
    toast({
      title: "Block updated",
      description: "Your changes have been saved.",
      duration: 3000,
    });
  };

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#1e1e1e]">
        <div className="text-center max-w-md px-6">
          <div className="mx-auto mb-4">
            <LogoIcon size={64} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to WorkLin
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a page from the sidebar or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  // Cast properties to strongly typed DatabaseProperty record
  const properties = page.properties as Record<string, DatabaseProperty> | undefined;

  return (
    <CollaborationProvider pageId={page.id}>
      <div className={`flex-1 flex flex-col relative overflow-hidden ${!page.cover ? 'bg-white dark:bg-[#1e1e1e]' : ''}`}>
        {/* Cover Image as Background */}
        {page.cover && (
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{ backgroundImage: `url(${page.cover})` }}
          >
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
          </div>
        )}
        
        {/* Cover Controls Overlay */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
          <PageCover
            url={page.cover}
            pageId={page.id}
            workspaceId="default"
            editable={true}
            onUpdate={(url) => {
              onUpdatePageCover(url || '');
            }}
          />
        </div>

        {/* Page Content Container */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 ${page.cover ? 'pt-20 sm:pt-28 md:pt-36' : 'pt-6 sm:pt-8 md:pt-12'} pb-8 sm:pb-12 md:pb-16`}>
            {/* Icon and Title Row */}
            <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6">
              {page.icon && (
                <div className="text-3xl sm:text-4xl md:text-5xl mt-1 select-none cursor-pointer hover:bg-white/10 dark:hover:bg-gray-800/50 rounded p-1 transition-colors">
                  {page.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={page.title}
                  onChange={(e) => onUpdatePageTitle(e.target.value)}
                  onFocus={() => setIsTitleEditing(true)}
                  onBlur={() => setIsTitleEditing(false)}
                  className={`w-full font-bold bg-transparent focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 ${
                    page.cover 
                      ? 'text-white text-2xl sm:text-3xl md:text-4xl drop-shadow-lg' 
                      : 'text-gray-900 dark:text-gray-100 text-2xl sm:text-3xl md:text-4xl'
                  }`}
                  placeholder="Untitled"
                />
                {/* View Switcher */}
                <div className="flex items-center gap-0.5 sm:gap-1 mt-3 sm:mt-4 border-b border-gray-200/50 dark:border-gray-800/50 overflow-x-auto">
                  <button
                    onClick={handleClearView}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                      !currentView 
                        ? 'border-primary text-primary' 
                        : page.cover
                        ? 'border-transparent text-white/70 hover:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <List size={12} className="sm:w-3.5 sm:h-3.5" /> 
                    <span className="hidden xs:inline">Document</span>
                  </button>
                  <button
                    onClick={() => handleSwitchView('table')}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                      currentView?.type === 'table' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : page.cover
                        ? 'border-transparent text-white/70 hover:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <TableIcon size={12} className="sm:w-3.5 sm:h-3.5" /> 
                    <span className="hidden xs:inline">Table</span>
                  </button>
                  <button
                    onClick={() => handleSwitchView('board')}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                      currentView?.type === 'board' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : page.cover
                        ? 'border-transparent text-white/70 hover:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" /> 
                    <span className="hidden xs:inline">Board</span>
                  </button>
                  <button
                    onClick={() => handleSwitchView('calendar')}
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                      currentView?.type === 'calendar' 
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                        : page.cover
                        ? 'border-transparent text-white/70 hover:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <CalendarIcon size={12} className="sm:w-3.5 sm:h-3.5" /> 
                    <span className="hidden xs:inline">Calendar</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowHistory(true)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded transition-colors text-xs sm:text-sm ${
                    page.cover 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  title="View version history"
                >
                  <History size={16} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">History</span>
                </button>
                <ExportMenu page={page} />
              </div>
            </div>

            {/* Database Properties Section - FIX: Use allPages instead of workspace.pages */}
            {allPages.length > 1 && (
              <div className="mt-4 sm:mt-6 md:mt-8">
                <PageProperties
                  page={page}
                  allPages={allPages}
                  onUpdatePage={(pageId, updates) => {
                    if (onUpdatePage) {
                      onUpdatePage(pageId, updates);
                    }
                  }}
                />
              </div>
            )}

            {/* Database Properties Section */}
            {properties && Object.keys(properties).length > 0 && (
              <div className={`mt-4 sm:mt-6 mb-6 sm:mb-8 p-3 sm:p-4 border rounded-lg ${
                page.cover 
                  ? 'border-white/20 bg-white/10 backdrop-blur-sm' 
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20'
              }`}>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(properties).map(([name, property]) => {
                    if (property.type === 'relation') {
                      return (
                        <RelationProperty
                          key={name}
                          page={page}
                          property={property as RelationType}
                          propertyName={name}
                          allPages={allPages}
                          onUpdate={(updatedPage) => onUpdatePage && onUpdatePage(page.id, updatedPage)}
                        />
                      );
                    }
                    if (property.type === 'rollup') {
                      return (
                        <RollupProperty
                          key={name}
                          page={page}
                          property={property as RollupType}
                          allPages={allPages}
                        />
                      );
                    }
                    if (property.type === 'formula') {
                      return (
                        <FormulaProperty
                          key={name}
                          page={page}
                          property={property as FormulaType}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Blocks Container */}
            <div className="mt-4 sm:mt-6 md:mt-8">
              {currentView ? (
                <div className="min-h-[400px] sm:min-h-[500px]">
                  {isLoadingViews ? (
                    <div className={`text-center py-10 ${page.cover ? 'text-white/70' : 'text-gray-500'}`}>Loading views...</div>
                  ) : (
                    <>
                      {currentView.type === 'table' && <TableView pages={databasePages} view={currentView} onOpenPage={(id) => window.location.href = `/page/${id}`} />}
                      {currentView.type === 'board' && <BoardView pages={databasePages} view={currentView} onOpenPage={(id) => window.location.href = `/page/${id}`} />}
                      {currentView.type === 'calendar' && <CalendarView pages={databasePages} view={currentView} onOpenPage={(id) => window.location.href = `/page/${id}`} />}
                    </>
                  )}
                </div>
              ) : (
                // Default Block Editor
                <>
                  {page.blocks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-8 sm:py-12"
                    >
                      <div className="text-center mb-6 sm:mb-8">
                        <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 ${
                          page.cover 
                            ? 'bg-white/20 backdrop-blur-sm' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Plus size={20} className={`sm:w-6 sm:h-6 ${page.cover ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-base sm:text-lg mb-2 ${
                          page.cover 
                            ? 'text-white/90' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          This page is empty
                        </p>
                        <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${
                          page.cover 
                            ? 'text-white/70' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          Type <kbd className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs ${
                            page.cover 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>/</kbd> to insert blocks
                        </p>
                        <button
                          onClick={() => handleAddBlock('paragraph')}
                          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-xs sm:text-sm font-medium"
                        >
                          <Plus size={14} className="sm:w-4 sm:h-4" />
                          Add your first block
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-1">
                      {page.blocks.map((block, index) => (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <BlockComponent
                            block={block}
                            onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                            onDelete={() => handleDeleteBlock(block.id)}
                            onAddBlock={() => handleAddBlock('paragraph')}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Add Block Button - Always visible at bottom */}
                  <div className="mt-6 sm:mt-8 mb-8 sm:mb-12">
                    <button
                      onClick={() => handleAddBlock('paragraph')}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full ${
                        page.cover
                          ? 'text-white/60 hover:text-white hover:bg-white/10'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Plus size={16} className={`sm:w-[18px] sm:h-[18px] opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <span className="text-xs sm:text-sm">
                        Type <kbd className={`px-1 sm:px-1.5 py-0.5 rounded text-xs ${
                          page.cover 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>/</kbd> for commands
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Version History Modal */}
        {showHistory && (
          <VersionHistory
            pageId={page.id}
            currentUserId="local-user"
            onClose={() => setShowHistory(false)}
            onRestore={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    </CollaborationProvider>
  );
};