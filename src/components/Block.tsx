// src/components/Block.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Block as BlockType } from '../types/workspace';
import { Trash2, GripVertical, MessageSquare } from 'lucide-react';
import { BlockTypeSelector } from './BlockTypeSelector';
import { CommentThread } from './comments/CommentThread';
import { getCommentCount } from '../lib/firebase/comments';
import { BlockPermissionSelector } from './BlockPermissionSelector';
import { useWorkspaceStore } from '../store/workspaceStore';
import { canEditBlock } from '../lib/firebase/block-permissions';
import { motion } from 'framer-motion';
import { AIBlock } from './editor/AIBlock';
import { EquationBlock } from './blocks/EquationBlock';
import { EmbedBlock } from './blocks/EmbedBlock';
import { CodeBlock } from './blocks/CodeBlock';

interface BlockProps {
  block: BlockType;
  onUpdate: (updates: Partial<BlockType>) => void;
  onDelete: () => void;
  onAddBlock: () => void;
}

/**
 * Block Component - Notion-style editable content block
 * 
 * This component handles:
 * 1. Real-time editing with local state optimization (prevents input lag)
 * 2. Permission checking (view/edit based on block permissions)
 * 3. Multiple block types (text, headings, lists, checkboxes, code, etc.)
 * 4. Comment system integration
 * 5. Drag & drop handle (visual only - functionality not yet implemented)
 * 
 * Performance Optimization:
 * - Uses local state for immediate UI updates
 * - Debounces database writes to reduce Firestore calls
 * - Auto-resizes textarea based on content
 * 
 * @param block - The block data to render
 * @param onUpdate - Callback to update block in parent/database
 * @param onDelete - Callback to delete this block
 * @param onAddBlock - Callback to add a new block below this one
 */
export const Block: React.FC<BlockProps> = ({
  block,
  onUpdate,
  onDelete,
  onAddBlock,
}) => {
  // Get current user from global store
  const { user } = useWorkspaceStore();
  const userId = user?.uid || 'local-user'; // Fallback for demo mode

  // Check permissions - determines if user can edit this block
  const canEdit = canEditBlock(block, userId);
  const canChangePermissions = block.createdBy === userId; // Only creator can change permissions

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [hasComments, setHasComments] = useState(false);

  /**
   * LOCAL STATE FOR IMMEDIATE TYPING RESPONSE
   * 
   * Problem: If we only update via props, there's a delay between:
   * 1. User types → 2. State update → 3. Database write → 4. Props update → 5. Re-render
   * 
   * Solution: Use local state for instant UI updates, then sync to database
   * This prevents input lag on slow networks or when Firestore is slow
   */
  const [localText, setLocalText] = useState(() => {
    if (block.text !== undefined) return block.text;
    if (block.content) {
      const div = document.createElement('div');
      div.innerHTML = block.content;
      return div.textContent || '';
    }
    return '';
  });

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  /**
   * Sync local state with props when block changes externally
   * (e.g., real-time updates from other users via Firestore)
   * 
   * Only update if not currently editing to avoid cursor jumping
   */
  useEffect(() => {
    const currentText = block.text !== undefined ? block.text : (block.content || '');
    if (currentText !== localText && !isEditing) {
      setLocalText(currentText);
    }
  }, [block.text, block.content, isEditing]);

  /**
   * Check for existing comments on this block
   * Updates the comment badge indicator
   */
  useEffect(() => {
    const checkComments = async () => {
      const count = await getCommentCount(block.id);
      setHasComments(count > 0);
    };
    checkComments();
  }, [block.id, showComments]);

  /**
   * Auto-focus input when editing mode is enabled
   */
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  /**
   * Auto-resize textarea based on content
   * Prevents scrolling inside the textarea
   */
  useEffect(() => {
    if (block.type !== 'heading1' && block.type !== 'heading2' && block.type !== 'heading3') {
      const target = inputRef.current as HTMLTextAreaElement;
      if (target) {
        target.style.height = 'auto';
        target.style.height = target.scrollHeight + 'px';
      }
    }
  }, [localText, block.type]);

  /**
   * Handle keyboard shortcuts and special keys
   * 
   * - Enter: Create new block below (like Notion)
   * - Backspace (on empty): Delete this block
   * - IME Composition: Prevent Enter during Chinese/Japanese input
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent actions during IME composition (Chinese/Japanese/Korean input)
    if (e.nativeEvent.isComposing) return;
    if (!canEdit) return; // Block keyboard actions if user can't edit

    // Enter key: Create new block below (Notion-style)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      onAddBlock();
    }

    // Backspace on empty block: Delete this block
    if (e.key === 'Backspace' && inputRef.current) {
      if (localText === '') {
        e.preventDefault();
        onDelete();
      }
    }

    // Future: '/' key could open command menu (like Notion)
  };

  /**
   * Handle text input changes
   * 
   * Strategy:
   * 1. Update local state immediately (instant UI feedback)
   * 2. Call onUpdate to sync to database (async, happens in background)
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // 1. Update UI immediately (no lag)
    setLocalText(newValue);

    // 2. Sync to database (happens asynchronously)
    onUpdate({
      text: newValue,
      content: newValue,
    });
  };

  // Common CSS classes for all input types
  const commonClasses = 'w-full bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600';

  /**
   * Render the appropriate input/component based on block type
   * 
   * Block Types:
   * - equation: LaTeX math equations
   * - embed: YouTube, Twitter, etc. embeds
   * - code-enhanced: Syntax-highlighted code
   * - ai: AI-powered content generation
   * - heading1/2/3: Large headings
   * - bulleted-list: Bullet point items
   * - checkbox: Todo items with checkboxes
   * - paragraph: Default text block
   */
  const renderContent = () => {
    switch (block.type) {
      case 'equation':
        return <EquationBlock block={block} onUpdate={onUpdate} />;

      case 'embed':
        return <EmbedBlock block={block} onUpdate={onUpdate} />;

      case 'code-enhanced':
        return <CodeBlock block={block} onUpdate={onUpdate} />;

      case 'ai':
        return <AIBlock block={block} onUpdate={onUpdate} />;
        
      case 'heading1':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={localText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Heading 1"
            className={`${commonClasses} text-3xl font-bold mt-1 mb-2`}
            readOnly={!canEdit}
          />
        );
        
      case 'heading2':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={localText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Heading 2"
            className={`${commonClasses} text-2xl font-semibold mt-1 mb-2`}
            readOnly={!canEdit}
          />
        );
        
      case 'heading3':
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={localText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Heading 3"
            className={`${commonClasses} text-xl font-semibold mt-1 mb-2`}
            readOnly={!canEdit}
          />
        );
        
      case 'bulleted-list':
        return (
          <div className="flex gap-3 items-start group/list">
            <span className="text-gray-400 dark:text-gray-600 mt-2 text-lg leading-none select-none">•</span>
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="text"
              value={localText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="List item"
              className={`${commonClasses} flex-1`}
              readOnly={!canEdit}
            />
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex gap-3 items-start">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => canEdit && onUpdate({ checked: e.target.checked })}
              className="mt-2 cursor-pointer w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              disabled={!canEdit}
            />
            <input
              ref={inputRef as React.Ref<HTMLInputElement>}
              type="text"
              value={localText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="Todo item"
              className={`${commonClasses} flex-1 ${
                block.checked ? 'line-through text-gray-400 dark:text-gray-600' : ''
              }`}
              readOnly={!canEdit}
            />
          </div>
        );
        
      default: // Paragraph (default block type)
        return (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={localText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Type '/' for commands"
            rows={1}
            className={`${commonClasses} text-base leading-relaxed min-h-[1.5rem]`}
            style={{ overflow: 'hidden', resize: 'none' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
            readOnly={!canEdit}
          />
        );
    }
  };

  return (
    <>
      <div
        className="group/block relative flex items-start gap-2 py-1 px-1 -mx-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Block Controls (visible on hover) */}
        <div className={`flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity ${isHovered || showComments ? 'opacity-100' : ''}`}>
          {/* Drag Handle (visual only - drag functionality not yet implemented) */}
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
            <GripVertical size={14} />
          </button>
          
          {/* Block Type Selector (paragraph → heading, list, etc.) */}
          <BlockTypeSelector
            currentType={block.type}
            onChange={(type) => canEdit && onUpdate({ type })}
          />
          
          {/* Permission Selector (public/private/restricted) */}
          <BlockPermissionSelector
            currentType={block.permissions?.type}
            onChange={(type) => onUpdate({ permissions: { ...block.permissions, type } })}
            readOnly={!canChangePermissions}
          />

          {/* Comments Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
              hasComments || showComments ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
            aria-label="Comments"
            title="Comments"
          >
            <MessageSquare size={14} fill={hasComments ? "currentColor" : "none"} />
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Delete block"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Block Content */}
        <div className="flex-1 min-w-0" onClick={() => !isEditing && canEdit && setIsEditing(true)}>
          {renderContent()}
        </div>

        {/* Comment Thread Popup (positioned absolutely) */}
        {showComments && (
          <div className="absolute right-0 z-20 mt-2 transform translate-x-full -translate-y-full md:translate-x-0 md:translate-y-2">
            <CommentThread blockId={block.id} onClose={() => setShowComments(false)} />
          </div>
        )}
      </div>
    </>
  );
};