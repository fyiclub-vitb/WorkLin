/**
 * Full-Text Search Indexing Library (Client-Side)
 * 
 * This module handles building searchable documents from workspace pages.
 * No Firebase/Firestore dependencies - works entirely on the client side.
 * Compatible with Firebase Spark/free tier - no billing required.
 */

import { Page, Block } from '../../types/workspace';

/**
 * Search document structure for MiniSearch
 */
export interface SearchDocument {
  id: string; // pageId
  pageId: string;
  workspaceId: string;
  title: string;
  content: string; // Plain text extracted from blocks
  tags: string; // Tags joined as string for search
  type: string;
  createdBy?: string;
  updatedAt: number; // Timestamp for recency ranking
  // For display
  originalTitle: string;
  originalTags: string[];
}

/**
 * Extract plain text from a block
 */
function extractTextFromBlock(block: Block): string {
  let text = '';
  
  // Extract from text field
  if (block.text) {
    text += block.text + ' ';
  }
  
  // Extract from content field (strip HTML tags if present)
  if (block.content) {
    const plainText = block.content
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    text += plainText + ' ';
  }
  
  // Extract from properties (e.g., table data, image alt text)
  if (block.properties) {
    Object.values(block.properties).forEach((value) => {
      if (typeof value === 'string') {
        text += value + ' ';
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === 'string') {
            text += item + ' ';
          }
        });
      }
    });
  }
  
  return text.trim();
}

/**
 * Normalize text for search
 * Removes accents, converts to lowercase, removes special characters
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build searchable documents from pages
 * This is a pure function that transforms pages into search documents
 * No Firestore writes - entirely client-side
 */
export function buildSearchDocuments(pages: Page[]): SearchDocument[] {
  console.log('[buildSearchDocuments] Input pages:', pages.length);
  
  const documents = pages
    .filter(page => {
      // Only filter out archived pages
      const isValid = !page.isArchived;
      if (!isValid) {
        console.log('[buildSearchDocuments] Filtered out archived page:', page.id);
      }
      return isValid;
    })
    .map(page => {
      // Extract all text content from blocks
      const contentParts: string[] = [];
      if (page.blocks && page.blocks.length > 0) {
        page.blocks.forEach((block) => {
          const blockText = extractTextFromBlock(block);
          if (blockText) {
            contentParts.push(blockText);
          }
        });
      }

      const fullContent = contentParts.join(' ');
      const tags = page.tags || [];
      const tagsString = tags.join(' '); // Join tags for search

      // Convert updatedAt to timestamp for ranking
      const updatedAt = page.updatedAt instanceof Date 
        ? page.updatedAt.getTime() 
        : new Date(page.updatedAt).getTime();

      const doc: SearchDocument = {
        id: page.id, // MiniSearch uses 'id' field
        pageId: page.id,
        workspaceId: page.workspaceId || '',
        title: page.title || 'Untitled',
        content: fullContent,
        tags: tagsString,
        type: page.type || 'document',
        createdBy: page.createdBy,
        updatedAt,
        // Keep original for display
        originalTitle: page.title || 'Untitled',
        originalTags: tags,
      };
      
      console.log('[buildSearchDocuments] Built document:', {
        id: doc.id,
        title: doc.title,
        contentLength: doc.content.length,
        tags: doc.tags,
      });
      
      return doc;
    });
  
  console.log('[buildSearchDocuments] Output documents:', documents.length);
  return documents;
}
