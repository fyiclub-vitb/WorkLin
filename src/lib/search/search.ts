/**
 * Full-Text Search Service (Client-Side)
 * 
 * Provides full-text search with fuzzy matching, typo tolerance, and result ranking.
 * Uses MiniSearch library - entirely client-side, no Firebase billing required.
 * Compatible with Firebase Spark/free tier.
 */

import MiniSearch from 'minisearch';
import { SearchDocument, buildSearchDocuments } from './indexing';
import { Page } from '../../types/workspace';

const SEARCH_ANALYTICS_KEY = 'search_analytics';
const RECENT_SEARCHES_KEY = 'worklin-recent-searches';

export interface SearchOptions {
  workspaceId: string;
  query: string;
  limit?: number;
  fuzzyThreshold?: number; // 0-1, lower = more strict (MiniSearch uses 0.2-1.0)
  typoTolerance?: number; // MiniSearch handles this via fuzzy option
}

export interface SearchResult {
  page: Page;
  score: number;
  matches: {
    title: boolean;
    content: boolean;
    tags: boolean;
  };
  highlights: string[]; // Matched text snippets
  matchTerms: string[]; // Terms that matched
}

export interface SearchAnalytics {
  query: string;
  workspaceId: string;
  resultsCount: number;
  timestamp: number;
  clickedPageId?: string;
}

/**
 * Create a MiniSearch index from search documents
 */
export function createSearchIndex(documents: SearchDocument[]): MiniSearch<SearchDocument> {
  console.log('[createSearchIndex] Creating index with', documents.length, 'documents');
  
  const index = new MiniSearch<SearchDocument>({
    fields: ['title', 'content', 'tags', 'type'], // Fields to index
    storeFields: ['pageId', 'workspaceId', 'title', 'content', 'tags', 'type', 'createdBy', 'updatedAt', 'originalTitle', 'originalTags'], // Fields to store
    searchOptions: {
      boost: { title: 3, tags: 2, content: 1 }, // Title matches weighted highest
      fuzzy: 0.2, // Fuzzy matching threshold (0.2 = typo tolerance)
      prefix: true, // Enable prefix matching
    },
  });

  // Add all documents to the index
  if (documents.length > 0) {
    index.addAll(documents);
    console.log('[createSearchIndex] Index created, document count:', index.documentCount);
    console.log('[createSearchIndex] Sample indexed doc:', documents[0]);
  } else {
    console.warn('[createSearchIndex] No documents to index!');
  }

  return index;
}

/**
 * Search the index with fuzzy matching and ranking
 */
export function searchIndex(
  query: string,
  index: MiniSearch<SearchDocument>,
  documents: SearchDocument[],
  options: SearchOptions
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const { limit = 20, fuzzyThreshold = 0.2 } = options;

  console.log('[searchIndex] Searching with query:', query);
  console.log('[searchIndex] Index document count:', index.documentCount);
  console.log('[searchIndex] Documents available:', documents.length);

  // Perform search with fuzzy matching
  const searchResults = index.search(query, {
    fuzzy: fuzzyThreshold, // 0.2 = allows 1-2 character typos
    prefix: true,
    boost: { title: 3, tags: 2, content: 1 },
    weights: { fuzzy: 0.2, prefix: 0.8 }, // Prefer prefix matches over fuzzy
  });
  
  console.log('[searchIndex] Raw search results:', searchResults.length);
  console.log('[searchIndex] Sample result:', searchResults[0]);

  // Map results to SearchResult format
  const mappedResults: SearchResult[] = searchResults.slice(0, limit)
    .map((result) => {
      const doc = documents.find(d => d.id === result.id);
      if (!doc) {
        return null;
      }

      // Determine what matched
      const queryLower = query.toLowerCase();
      const titleLower = doc.title.toLowerCase();
      const tagsLower = doc.tags.toLowerCase();
      const contentLower = doc.content.toLowerCase();

      const matches: SearchResult['matches'] = {
        title: titleLower.includes(queryLower),
        tags: tagsLower.includes(queryLower) || doc.originalTags.some(tag => 
          tag.toLowerCase().includes(queryLower)
        ),
        content: contentLower.includes(queryLower),
      };

    // Extract highlights (snippets)
    const highlights: string[] = [];
    if (matches.title) {
      highlights.push(`Title: ${doc.title}`);
    }
    if (matches.tags && doc.originalTags.length > 0) {
      const matchedTags = doc.originalTags.filter(tag => 
        tag.toLowerCase().includes(queryLower)
      );
      if (matchedTags.length > 0) {
        highlights.push(`Tags: ${matchedTags.join(', ')}`);
      }
    }
    if (matches.content) {
      // Find content snippet
      const contentIndex = contentLower.indexOf(queryLower);
      if (contentIndex !== -1) {
        const start = Math.max(0, contentIndex - 50);
        const end = Math.min(doc.content.length, contentIndex + query.length + 50);
        highlights.push(`Content: ...${doc.content.substring(start, end)}...`);
      }
    }

    // Calculate final score with recency boost
    let finalScore = result.score || 0;
    
    // Recency boost (pages updated recently get slight boost)
    const daysSinceUpdate = (Date.now() - doc.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      finalScore += 10;
    } else if (daysSinceUpdate < 30) {
      finalScore += 5;
    }

    // Build page object for result
    const page: Page = {
      id: doc.pageId,
      title: doc.originalTitle,
      icon: '',
      blocks: [], // Will be loaded separately if needed
      tags: doc.originalTags,
      type: doc.type as any,
      createdBy: doc.createdBy,
      createdAt: new Date(doc.updatedAt - 86400000), // Approximate
      updatedAt: new Date(doc.updatedAt),
      workspaceId: doc.workspaceId,
    };

      return {
        page,
        score: finalScore,
        matches,
        highlights: highlights.slice(0, 3),
        matchTerms: result.terms || [],
      };
    })
    .filter((r): r is SearchResult => r !== null);

  console.log('[searchIndex] Mapped results:', mappedResults.length);
  return mappedResults;
}

/**
 * Search workspace pages
 * Main entry point for search functionality
 */
export function searchWorkspace(
  query: string,
  pages: Page[],
  config: SearchOptions
): SearchResult[] {
  console.log('[searchWorkspace] Input:', { query, pagesCount: pages.length, workspaceId: config.workspaceId });
  
  if (!query.trim() || !pages.length) {
    console.log('[searchWorkspace] Early return - empty query or pages');
    return [];
  }

  // Filter pages - include pages that match workspaceId OR pages without workspaceId (for backward compatibility)
  const filteredPages = pages.filter(p => {
    if (p.isArchived) return false;
    // If page has workspaceId, it must match
    if (p.workspaceId) {
      return p.workspaceId === config.workspaceId;
    }
    // If page doesn't have workspaceId, include it (for pages created before workspaceId was added)
    return true;
  });
  
  // Ensure all filtered pages have workspaceId set
  const pagesWithWorkspaceId = filteredPages.map(p => ({
    ...p,
    workspaceId: p.workspaceId || config.workspaceId,
  }));
  
  console.log('[searchWorkspace] Filtered pages:', filteredPages.length);
  console.log('[searchWorkspace] Filtered pages details:', filteredPages.map(p => ({ 
    id: p.id, 
    title: p.title, 
    workspaceId: p.workspaceId,
    blocksCount: p.blocks?.length || 0 
  })));

  // Build search documents from pages
  const documents = buildSearchDocuments(pagesWithWorkspaceId);
  console.log('[searchWorkspace] Documents built:', documents.length);
  console.log('[searchWorkspace] Sample document:', documents[0]);

  if (documents.length === 0) {
    console.log('[searchWorkspace] No documents to index');
    return [];
  }

  // Create search index
  const index = createSearchIndex(documents);
  console.log('[searchWorkspace] Index created, document count:', index.documentCount);

  // Perform search
  const results = searchIndex(query, index, documents, config);
  console.log('[searchWorkspace] Search results:', results.length);
  
  return results;
}

/**
 * Get search suggestions based on query
 * Uses recent searches and indexed content
 */
export function getSearchSuggestions(
  workspaceId: string,
  partialQuery: string,
  pages: Page[],
  limit: number = 5
): string[] {
  if (!partialQuery.trim() || partialQuery.length < 2) {
    // Return recent searches if no query
    return getRecentSearches(limit);
  }

  const suggestions = new Set<string>();
  const queryLower = partialQuery.toLowerCase();

  // Get suggestions from recent searches
  const recent = getRecentSearches(20);
  recent.forEach(search => {
    if (search.toLowerCase().includes(queryLower) || search.toLowerCase().startsWith(queryLower)) {
      suggestions.add(search);
    }
  });

  // Get suggestions from page titles and tags
  const documents = buildSearchDocuments(pages.filter(p => p.workspaceId === workspaceId));
  documents.forEach(doc => {
    const titleLower = doc.title.toLowerCase();
    if (titleLower.startsWith(queryLower) || titleLower.includes(queryLower)) {
      suggestions.add(doc.title);
    }

    // Add tag suggestions
    doc.originalTags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower.startsWith(queryLower)) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(limit: number = 10): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      return JSON.parse(stored).slice(0, limit);
    }
  } catch (e) {
    console.error('Error loading recent searches:', e);
  }
  return [];
}

/**
 * Save a search to recent searches
 */
export function saveRecentSearch(query: string): void {
  try {
    const recent = getRecentSearches(50); // Get more to avoid duplicates
    const updated = [query, ...recent.filter(s => s !== query)].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving recent search:', e);
  }
}

/**
 * Log search analytics to localStorage
 * No Firestore writes - entirely client-side
 */
export function logSearchAnalytics(analytics: Omit<SearchAnalytics, 'timestamp'>): void {
  try {
    const existing = localStorage.getItem(SEARCH_ANALYTICS_KEY);
    const analyticsList: SearchAnalytics[] = existing ? JSON.parse(existing) : [];
    
    const entry: SearchAnalytics = {
      ...analytics,
      timestamp: Date.now(),
    };

    analyticsList.push(entry);
    
    // Keep only last 1000 entries to avoid localStorage bloat
    const trimmed = analyticsList.slice(-1000);
    localStorage.setItem(SEARCH_ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error logging search analytics:', e);
    // Don't throw - analytics failures shouldn't break search
  }
}

/**
 * Log when a search result is clicked
 */
export function logSearchClick(
  query: string,
  pageId: string,
  workspaceId: string
): void {
  try {
    const existing = localStorage.getItem(SEARCH_ANALYTICS_KEY);
    const analyticsList: SearchAnalytics[] = existing ? JSON.parse(existing) : [];
    
    const entry: SearchAnalytics = {
      query,
      workspaceId,
      resultsCount: 0, // Not applicable for clicks
      timestamp: Date.now(),
      clickedPageId: pageId,
    };

    analyticsList.push(entry);
    
    // Keep only last 1000 entries
    const trimmed = analyticsList.slice(-1000);
    localStorage.setItem(SEARCH_ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Error logging search click:', e);
  }
}

/**
 * Get search analytics from localStorage
 */
export function getSearchAnalytics(workspaceId?: string): SearchAnalytics[] {
  try {
    const stored = localStorage.getItem(SEARCH_ANALYTICS_KEY);
    if (stored) {
      const analytics: SearchAnalytics[] = JSON.parse(stored);
      if (workspaceId) {
        return analytics.filter(a => a.workspaceId === workspaceId);
      }
      return analytics;
    }
  } catch (e) {
    console.error('Error loading search analytics:', e);
  }
  return [];
}
