// src/types/workspace.ts
import { BlockPermission } from './permission';
import { ViewDefinition } from './view';

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulleted-list'
  | 'numbered-list'
  | 'checkbox'
  | 'code'
  | 'quote'
  | 'divider'
  | 'image'
  | 'table'
  | 'toggle'
  | 'callout'
  | 'ai'
  | 'equation'      // NEW: LaTeX equation block
  | 'embed'         // NEW: Embedded content block
  | 'code-enhanced'; // NEW: Enhanced code block with syntax highlighting

export interface Block {
  id: string;
  type: BlockType;
  content?: string; // Rich text content (HTML/JSON)
  text?: string; // Plain text fallback
  checked?: boolean;
  properties?: Record<string, any>; // Additional properties (e.g., image URL, table data, embed URL, language)
  order?: number; // Block order in page
  parentId?: string; // For nested blocks (toggle lists)
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  lastEditedBy?: string;
  permissions?: BlockPermission;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  cover?: string; // Cover image URL
  blocks: Block[];
  
  // Database Properties
  properties?: Record<string, any>; // Typed as any to avoid circular dependency with DatabaseProperty; Custom properties for database items
  propertyValues?: Record<string, any>;

  workspaceId?: string; // Optional for backward compatibility
  parentId?: string; // For nested pages
  isArchived?: boolean;
  isPublic?: boolean;
  tags?: string[];
  type?: 'document' | 'canvas' | 'kanban' | string;
  views?: ViewDefinition[]; // Saved views configuration
  lastActiveViewId?: string; // Last selected view ID
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastEditedBy?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  members: string[]; // User IDs
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    theme?: 'light' | 'dark' | 'auto';
    defaultView?: 'list' | 'grid';
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  workspaces: string[]; // Workspace IDs
}

export interface CollaborationPresence {
  userId: string;
  userName: string;
  userColor: string;
  cursor?: {
    blockId: string;
    position: number;
  };
  selection?: {
    blockId: string;
    start: number;
    end: number;
  };
  lastSeen: Date;
}