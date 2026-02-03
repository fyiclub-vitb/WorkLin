// src/components/PageEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Page, BlockType, Block } from '../types/workspace';
import { Block as BlockComponent } from './Block';
import { Plus, History, LayoutGrid, Table as TableIcon, Calendar as CalendarIcon, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PageProperties } from './PageProperties';
import { PageCover } from '../pages/PageCover';
import { LogoIcon } from './Logo';

import { CollaborationProvider, useCollaboration } from './collaboration/CollaborationProvider';
import { useToast } from '../hooks/use-toast';
import { ExportMenu } from "./page/ExportMenu";
import { VersionHistory } from "./VersionHistory";
import { EmptyState } from './ui/empty-state';
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

// ▶ Presence imports
import { PresenceIndicator } from './collaboration/PresenceIndicator';
import { setPresencePhoto } from '../lib/firebase/presence';
import { subscribeToAuth } from '../lib/firebase/auth';

interface PageEditorProps {
  page: Page | undefined;
  allPages: Page[];
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageCover: (url: string | null) => void;
  onUpdatePage?: (pageId: string, updates: Partial<Page>) => void;
}

// ---------------------------------------------------------------------------
// Inner component — lives inside <CollaborationProvider> so it can call
// useCollaboration() and access the Yjs provider / awareness.
// ---------------------------------------------------------------------------

const PageEditorInner: React.FC<PageEditorProps> = ({
  page,
  allPages,
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

  // ▶ Presence: once auth resolves, push the user's photoURL into awareness
  //   so PresenceIndicator can render actual avatar photos.
  //   CollaborationProvider already set name + color via cursor-sync;
  //   this just adds the missing photoURL field.
  const { provider } = useCollaboration();

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user && provider?.awareness) {
        setPresencePhoto(provider.awareness, user.photoURL);
      }
    });
    return () => unsubscribe();
  }, [provider]);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize view from page settings
  useEffect(() => {
    if (page?.lastActiveViewId && page.views) {
      const savedView = page.views.find(v => v.id === page.lastActiveViewId);
      if (savedView) setCurrentView(savedView);
    }
  }, [page?.id]);

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

    setCurrentView(newView);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!page || !over || active.id === over.id) return;

    const oldIndex = page.blocks.findIndex(block => block.id === active.id);
    const newIndex = page.blocks.findIndex(block => block.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlocks = arrayMove(page.blocks, oldIndex, newIndex);

      if (onUpdatePage) {
        onUpdatePage(page.id, { blocks: reorderedBlocks });
        toast({
          title: "Block moved",
          description: "Block order has been updated.",
          duration: 2000,
        });
      }
    }
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

  const properties = page.properties as Record<string, DatabaseProperty> | undefined;

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#1e1e1e]">
      {/* Page Scrollable Area */}
      <div className="flex-1 overflow-y-auto relative z-10 scrollbar-thin">

        {/* Cover Image Section */}
        <div className="relative w-full group">
          {page.cover ? (
            <div className="w-full h-[25vh] min-h-[160px] max-h-[280px] overflow-hidden">
              <img
                src={page.cover}
                alt="Page cover"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-20 sm:h-24 w-full" />
          )}

          {/* Cover Controls - Top Right */}
          <div className={`absolute top-4 right-4 z-20 ${page.cover ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`}>
            <PageCover
              url={page.cover}
              pageId={page.id}
              workspaceId="default"
              editable={true}
              onUpdate={(url) => {
                onUpdatePageCover(url || null);
              }}
            />
          </div>
        </div>

        {/* Page Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-32">
          {/* Icon and Title Row */}
          <div className={`flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 ${page.cover ? '-mt-12' : ''} relative z-20`}>
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
                className="w-full font-bold bg-transparent focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 text-2xl sm:text-3xl md:text-4xl"
                placeholder="Untitled"
              />

              {/* View Switcher */}
              <div className="flex items-center gap-0.5 sm:gap-1 mt-3 sm:mt-4 border-b border-gray-200/50 dark:border-gray-800/50 overflow-x-auto">
                <button
                  onClick={handleClearView}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${!currentView
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  <List size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Document</span>
                </button>
                <button
                  onClick={() => handleSwitchView('table')}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${currentView?.type === 'table'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  <TableIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Table</span>
                </button>
                <button
                  onClick={() => handleSwitchView('board')}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${currentView?.type === 'board'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Board</span>
                </button>
                <button
                  onClick={() => handleSwitchView('calendar')}
                  className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-t-md border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${currentView?.type === 'calendar'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                  <CalendarIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Calendar</span>
                </button>
              </div>
            </div>

            {/* Header actions: Presence avatars → History → Export */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* ▶ Presence indicator — zero props, reads from Yjs context */}
              <PresenceIndicator />

              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded transition-colors text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                title="View version history"
              >
                <History size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
              <ExportMenu page={page} />
            </div>
          </div>

          {/* Database Properties Section */}
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

          {properties && Object.keys(properties).length > 0 && (
            <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 p-3 sm:p-4 border rounded-lg border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
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

          {/* Content Area: Blocks or View */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            {currentView ? (
              <div className="min-h-[400px] sm:min-h-[500px]">
                {isLoadingViews ? (
                  <div className="text-center py-10 text-gray-500">Loading views...</div>
                ) : (
                  <>
                    {currentView.type === 'table' && <TableView pages={databasePages} view={currentView} onOpenPage={(id) => window.location.href = `/page/${id}`} />}
                    {currentView.type === 'board' && <BoardView pages={databasePages} view={currentView} onOpenPage={(id) => window.location.href = `/page/${id}`} />}
                    {currentView.type === 'calendar' && <CalendarView pages={databasePages} view={currentView} onOpenPage={(id) => window.location.href = `/page/${id}`} />}
                  </>
                )}
              </div>
            ) : (
              <>
                {page.blocks.length === 0 ? (
                  <EmptyState
                    title="Start writing"
                    description="Add your first block or type / for commands."
                    actionLabel="Add block"
                    onAction={() => handleAddBlock('paragraph')}
                    icon={<Plus size={24} />}
                    inverted={!!page.cover}
                    className="py-8 sm:py-12"
                  />
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={page.blocks.map(block => block.id)}
                      strategy={verticalListSortingStrategy}
                    >
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
                    </SortableContext>
                  </DndContext>
                )}

                {/* Add Block Button */}
                <div className="mt-6 sm:mt-8 mb-8 sm:mb-12">
                  <button
                    onClick={() => handleAddBlock('paragraph')}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full ${page.cover
                      ? 'text-white/60 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Plus size={16} className={`sm:w-[18px] sm:h-[18px] opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-xs sm:text-sm">
                      Type <kbd className={`px-1 sm:px-1.5 py-0.5 rounded text-xs ${page.cover
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
  );
};

// ---------------------------------------------------------------------------
// Public export — wraps the inner component in CollaborationProvider exactly
// as the original did.  Public API is unchanged.
// ---------------------------------------------------------------------------

export const PageEditor: React.FC<PageEditorProps> = (props) => {
  const pageId = props.page?.id ?? '__no-page__';

  return (
    <CollaborationProvider pageId={pageId}>
      <PageEditorInner {...props} />
    </CollaborationProvider>
  );
};