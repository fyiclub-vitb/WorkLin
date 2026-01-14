import { BlockPermission } from './permission';

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
  | 'ai'; // Added AI block type

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  text?: string;
  checked?: boolean;
  properties?: Record<string, any>; 
  order?: number;
  parentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  lastEditedBy?: string;
  permissions?: BlockPermission;
}

// ... rest of file remains same