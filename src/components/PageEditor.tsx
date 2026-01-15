// src/components/PageEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Page, BlockType, Block } from '../types/workspace';
import { Block as BlockComponent } from './Block';
import { Plus, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageProperties } from './PageProperties';

import { CollaborationProvider } from './collaboration/CollaborationProvider';
import { useToast } from '../hooks/use-toast';
import { ExportMenu } from "./page/ExportMenu";
import { VersionHistory } from "./VersionHistory";

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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            W
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
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {/* Cover Image */}
        {page.cover && (
          <div
            className="h-48 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${page.cover})` }}
          />
        )}

        {/* Page Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-16 pt-8 pb-4">
            {/* Icon and Title Row */}
            <div className="flex items-start gap-3 mb-2">
              {page.icon && (
                <div className="text-5xl mt-1 select-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 transition-colors">
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
                  className="w-full text-4xl font-bold text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder="Untitled"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-sm text-gray-700 dark:text-gray-300"
                  title="View version history"
                >
                  <History size={18} />
                  <span className="hidden sm:inline">History</span>
                </button>
                <ExportMenu page={page} />
              </div>
            </div>

            {/* Database Properties Section - FIX: Use allPages instead of workspace.pages */}
            {allPages.length > 1 && (
              <div className="mt-8">
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
              <div className="mt-6 mb-8 p-4 border rounded-lg border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                <div className="space-y-4">
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
            <div className="mt-8">
              {page.blocks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      This page is empty
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                      Type <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">/</kbd> to insert blocks
                    </p>
                    <button
                      onClick={() => handleAddBlock('paragraph')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
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
              <div className="mt-8 mb-12">
                <button
                  onClick={() => handleAddBlock('paragraph')}
                  className="group flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors w-full"
                >
                  <Plus size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm">
                    Type <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/</kbd> for commands
                  </span>
                </button>
              </div>
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