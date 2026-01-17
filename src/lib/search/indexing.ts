/**
 * Full-Text Search Indexing Library
 * 
 * This module handles indexing of workspace content for full-text search.
 * It extracts searchable text from pages and blocks, and stores it in Firestore
 * for efficient searching with fuzzy matching and typo tolerance.
 */

import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Page, Block } from '../../types/workspace';

const SEARCH_INDEX_COLLECTION = 'search_index';

export interface SearchIndexEntry {
  id: string;
  pageId: string;
  workspaceId: string;
  title: string;
  content: string; // Plain text extracted from blocks
  tags: string[];
  type: string;
  createdBy?: string;
  updatedAt: Date;
  indexedAt: Date;
  // For fuzzy matching - store normalized versions
  normalizedTitle: string;
  normalizedContent: string;
  // Keywords extracted for better search
  keywords: string[];
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
 * Normalize text for fuzzy matching
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
 * Extract keywords from text
 */
function extractKeywords(text: string, minLength: number = 3): string[] {
  const words = normalizeText(text)
    .split(/\s+/)
    .filter(word => word.length >= minLength);
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  return Array.from(new Set(words.filter(word => !stopWords.has(word))));
}

/**
 * Index a page for full-text search
 */
export async function indexPage(page: Page): Promise<{ success: boolean; error?: string }> {
  try {
    if (!page.workspaceId) {
      return { success: false, error: 'Page must have a workspaceId' };
    }

    // Extract all text content from blocks
    const contentParts: string[] = [];
    page.blocks?.forEach((block) => {
      const blockText = extractTextFromBlock(block);
      if (blockText) {
        contentParts.push(blockText);
      }
    });

    const fullContent = contentParts.join(' ');
    const normalizedTitle = normalizeText(page.title || '');
    const normalizedContent = normalizeText(fullContent);
    
    // Combine title and content for keyword extraction
    const allText = `${page.title || ''} ${fullContent}`;
    const keywords = extractKeywords(allText);

    const indexEntry: Omit<SearchIndexEntry, 'id'> = {
      pageId: page.id,
      workspaceId: page.workspaceId,
      title: page.title || 'Untitled',
      content: fullContent,
      tags: page.tags || [],
      type: page.type || 'document',
      createdBy: page.createdBy,
      updatedAt: page.updatedAt instanceof Date ? page.updatedAt : new Date(page.updatedAt),
      indexedAt: new Date(),
      normalizedTitle,
      normalizedContent,
      keywords,
    };

    // Store in Firestore
    const indexDocRef = doc(db, SEARCH_INDEX_COLLECTION, page.id);
    await setDoc(indexDocRef, {
      ...indexEntry,
      indexedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error indexing page:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a page from the search index
 */
export async function removePageFromIndex(pageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const indexDocRef = doc(db, SEARCH_INDEX_COLLECTION, pageId);
    await deleteDoc(indexDocRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error removing page from index:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch index multiple pages
 */
export async function indexPages(pages: Page[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const page of pages) {
    const result = await indexPage(page);
    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
