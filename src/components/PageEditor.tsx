import React, { useState, useRef, useEffect } from "react";
import { Page, BlockType, Block } from "../types/workspace";
import { Block as BlockComponent } from "./Block";
import { Plus, MoreHorizontal, History } from "lucide-react";
import { motion } from "framer-motion";
import React from 'react';
import { Page, BlockType, Block } from '../types/workspace';
import { Block as BlockComponent } from './Block';
import { Plus } from 'lucide-react'; // Removed MoreHorizontal as it's no longer needed
import { motion } from 'framer-motion';
// FIX: Import from the correct location in 'src/pages/'
import { PageCover } from "../pages/PageCover";
import { ExportMenu } from "./page/ExportMenu";
import { VersionHistory } from "./VersionHistory";

interface PageEditorProps {
  page: Page | undefined;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  // This prop is passed from Workspace but not used here anymore (handled by PageHeader)
  onUpdatePageTitle: (title: string) => void; 
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
}) => {
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isTitleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isTitleEditing]);
  // Removed local state for title editing (isTitleEditing, titleInputRef)

  if (!page) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#1e1e1e]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
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

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e] overflow-hidden">
      
      {/* REMOVED: Old Title Input & Menu Button 
          KEPT: Cover Image & Icon support (optional)
      */}
      <div className="relative">
        {/* Cover Image Placeholder - Only renders if cover exists */}
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
            <div className="text-5xl mt-1 select-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 transition-colors">
              {page.icon}
            </div>
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
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <MoreHorizontal size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
        {/* Page Icon (if exists) */}
        {page.icon && (
           <div className="max-w-4xl mx-auto px-16 pt-12 pb-4">
             <div className="text-5xl mt-1">{page.icon}</div>
           </div>
        )}
      </div>

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
                    Type{" "}
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      /
                    </kbd>{" "}
                    to insert blocks
                  </p>
                  <button
                    onClick={() => onAddBlock("paragraph")}
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
                      onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                      onDelete={() => onDeleteBlock(block.id)}
                      onAddBlock={() => onAddBlock("paragraph")}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Block Button */}
            <div className="mt-8 mb-12">
              <button
                onClick={() => onAddBlock("paragraph")}
                className="group flex items-center gap-2 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors w-full"
              >
                <Plus
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-sm">
                  Type{" "}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    /
                  </kbd>{" "}
                  for commands
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
          currentUserId="local-user" // TODO: Replace with actual user ID from auth context
          onClose={() => setShowHistory(false)}
          onRestore={() => {
            // Refresh page data after restore
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
