/**
 * Full-Text Search Service
 * 
 * Provides full-text search with fuzzy matching, typo tolerance, and result ranking.
 * Uses Firestore for storage and client-side algorithms for fuzzy matching.
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SearchIndexEntry, normalizeText } from './indexing';
import { Page } from '../../types/workspace';

const SEARCH_INDEX_COLLECTION = 'search_index';
const SEARCH_ANALYTICS_COLLECTION = 'search_analytics';

export interface SearchOptions {
  workspaceId: string;
  query: string;
  limit?: number;
  fuzzyThreshold?: number; // 0-1, lower = more strict
  typoTolerance?: number; // Number of character differences allowed
}

export interface SearchResult {
  page: Page;
  score: number;
  matches: {
    title?: boolean;
    content?: boolean;
    tags?: boolean;
    keywords?: boolean;
  };
  highlights?: string[]; // Matched text snippets
}

export interface SearchAnalytics {
  query: string;
  userId: string;
  workspaceId: string;
  resultsCount: number;
  timestamp: Date;
  clickedResultId?: string;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching and typo tolerance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarityScore(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
}

/**
 * Check if query matches text with typo tolerance
 */
function matchesWithTypoTolerance(query: string, text: string, tolerance: number = 1): boolean {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);
  
  // Exact match
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  // Check if any word in the query matches with tolerance
  const queryWords = normalizedQuery.split(/\s+/);
  const textWords = normalizedText.split(/\s+/);

  for (const queryWord of queryWords) {
    if (queryWord.length < 3) continue; // Skip very short words
    
    for (const textWord of textWords) {
      const distance = levenshteinDistance(queryWord, textWord);
      const maxLen = Math.max(queryWord.length, textWord.length);
      
      // Allow matches if distance is within tolerance relative to word length
      if (distance <= tolerance || (distance / maxLen) <= 0.3) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate search score for a result
 * Higher score = better match
 */
function calculateScore(
  query: string,
  indexEntry: SearchIndexEntry,
  options: SearchOptions
): { score: number; matches: SearchResult['matches']; highlights: string[] } {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
  
  let score = 0;
  const matches: SearchResult['matches'] = {};
  const highlights: string[] = [];

  // Title match (highest weight)
  if (indexEntry.normalizedTitle.includes(normalizedQuery)) {
    score += 100;
    matches.title = true;
    highlights.push(`Title: ${indexEntry.title}`);
  } else {
    // Partial title match
    const titleScore = queryWords.reduce((acc, word) => {
      if (indexEntry.normalizedTitle.includes(word)) {
        return acc + 30;
      }
      // Fuzzy match in title
      const similarity = similarityScore(word, indexEntry.normalizedTitle);
      if (similarity > (options.fuzzyThreshold || 0.7)) {
        return acc + 20 * similarity;
      }
      return acc;
    }, 0);
    score += titleScore;
    if (titleScore > 0) matches.title = true;
  }

  // Tag match (high weight)
  if (indexEntry.tags.length > 0) {
    const tagMatches = indexEntry.tags.filter(tag =>
      normalizeText(tag).includes(normalizedQuery) ||
      queryWords.some(word => normalizeText(tag).includes(word))
    );
    if (tagMatches.length > 0) {
      score += 50 * tagMatches.length;
      matches.tags = true;
      highlights.push(`Tags: ${tagMatches.join(', ')}`);
    }
  }

  // Keyword match (medium weight)
  const keywordMatches = indexEntry.keywords.filter(keyword =>
    queryWords.some(word => keyword.includes(word) || word.includes(keyword))
  );
  if (keywordMatches.length > 0) {
    score += 20 * keywordMatches.length;
    matches.keywords = true;
  }

  // Content match (lower weight, but can accumulate)
  if (indexEntry.normalizedContent.includes(normalizedQuery)) {
    score += 30;
    matches.content = true;
    // Extract snippet
    const contentIndex = indexEntry.content.toLowerCase().indexOf(query.toLowerCase());
    if (contentIndex !== -1) {
      const start = Math.max(0, contentIndex - 50);
      const end = Math.min(indexEntry.content.length, contentIndex + query.length + 50);
      highlights.push(`Content: ...${indexEntry.content.substring(start, end)}...`);
    }
  } else {
    // Partial content match
    const contentScore = queryWords.reduce((acc, word) => {
      if (indexEntry.normalizedContent.includes(word)) {
        return acc + 5;
      }
      // Fuzzy match in content
      const words = indexEntry.normalizedContent.split(/\s+/);
      for (const contentWord of words) {
        if (contentWord.length >= 3) {
          const similarity = similarityScore(word, contentWord);
          if (similarity > (options.fuzzyThreshold || 0.7)) {
            return acc + 3 * similarity;
          }
        }
      }
      return acc;
    }, 0);
    score += contentScore;
    if (contentScore > 0) matches.content = true;
  }

  // Recency boost (pages updated recently get slight boost)
  const daysSinceUpdate = (Date.now() - indexEntry.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) {
    score += 10;
  } else if (daysSinceUpdate < 30) {
    score += 5;
  }

  return { score, matches, highlights };
}

/**
 * Perform full-text search
 */
export async function fullTextSearch(
  options: SearchOptions
): Promise<{ results: SearchResult[]; error?: string }> {
  try {
    const { workspaceId, query: searchQuery, limit: resultLimit = 50 } = options;
    
    if (!searchQuery.trim()) {
      return { results: [] };
    }

    // Fetch all indexed pages for the workspace
    const indexRef = collection(db, SEARCH_INDEX_COLLECTION);
    const q = query(
      indexRef,
      where('workspaceId', '==', workspaceId),
      orderBy('updatedAt', 'desc'),
      firestoreLimit(200) // Fetch more than needed for better ranking
    );

    const snapshot = await getDocs(q);
    const indexEntries: SearchIndexEntry[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      indexEntries.push({
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
        indexedAt: data.indexedAt?.toDate() || new Date(),
      } as SearchIndexEntry);
    });

    // Filter and score results
    const results: SearchResult[] = [];
    const typoTolerance = options.typoTolerance || 2;

    for (const entry of indexEntries) {
      // Check if entry matches query (with typo tolerance)
      const matchesQuery =
        matchesWithTypoTolerance(searchQuery, entry.title, typoTolerance) ||
        matchesWithTypoTolerance(searchQuery, entry.content, typoTolerance) ||
        entry.tags.some(tag => matchesWithTypoTolerance(searchQuery, tag, typoTolerance)) ||
        entry.keywords.some(keyword => matchesWithTypoTolerance(searchQuery, keyword, typoTolerance));

      if (matchesQuery) {
        const { score, matches, highlights } = calculateScore(searchQuery, entry, options);
        
        if (score > 0) {
          // Fetch the actual page data
          const page: Page = {
            id: entry.pageId,
            title: entry.title,
            icon: '',
            blocks: [], // Will be loaded separately if needed
            tags: entry.tags,
            type: entry.type as any,
            createdBy: entry.createdBy,
            createdAt: entry.updatedAt, // Approximate
            updatedAt: entry.updatedAt,
            workspaceId: entry.workspaceId,
          };

          results.push({
            page,
            score,
            matches,
            highlights: highlights.slice(0, 3), // Limit highlights
          });
        }
      }
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = results.slice(0, resultLimit);

    // Note: Search analytics are logged by the calling component with user context
    return { results: limitedResults };
  } catch (error: any) {
    console.error('Search error:', error);
    return { results: [], error: error.message };
  }
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(
  workspaceId: string,
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  try {
    if (!partialQuery.trim() || partialQuery.length < 2) {
      return [];
    }

    const normalizedQuery = normalizeText(partialQuery);
    
    // Fetch recent searches from analytics
    const analyticsRef = collection(db, SEARCH_ANALYTICS_COLLECTION);
    const q = query(
      analyticsRef,
      where('workspaceId', '==', workspaceId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(100)
    );

    const snapshot = await getDocs(q);
    const suggestions = new Set<string>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const query = data.query || '';
      const normalized = normalizeText(query);
      
      // Check if query starts with or contains the partial query
      if (normalized.startsWith(normalizedQuery) || normalized.includes(normalizedQuery)) {
        suggestions.add(query);
      }
    });

    // Also get suggestions from indexed content (titles, tags)
    const indexRef = collection(db, SEARCH_INDEX_COLLECTION);
    const indexQuery = query(
      indexRef,
      where('workspaceId', '==', workspaceId),
      firestoreLimit(50)
    );

    const indexSnapshot = await getDocs(indexQuery);
    indexSnapshot.forEach((doc) => {
      const data = doc.data();
      const title = data.title || '';
      const normalizedTitle = normalizeText(title);
      
      if (normalizedTitle.startsWith(normalizedQuery)) {
        suggestions.add(title);
      }

      // Add tag suggestions
      const tags = data.tags || [];
      tags.forEach((tag: string) => {
        const normalizedTag = normalizeText(tag);
        if (normalizedTag.startsWith(normalizedQuery)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  } catch (error: any) {
    console.error('Error getting suggestions:', error);
    return [];
  }
}

/**
 * Log search analytics
 */
export async function logSearchAnalytics(analytics: SearchAnalytics): Promise<void> {
  try {
    await addDoc(collection(db, SEARCH_ANALYTICS_COLLECTION), {
      ...analytics,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging search analytics:', error);
    // Don't throw - analytics failures shouldn't break search
  }
}

/**
 * Log when a search result is clicked
 */
export async function logSearchClick(
  query: string,
  pageId: string,
  userId: string,
  workspaceId: string
): Promise<void> {
  try {
    await addDoc(collection(db, SEARCH_ANALYTICS_COLLECTION), {
      query,
      userId,
      workspaceId,
      clickedResultId: pageId,
      timestamp: serverTimestamp(),
      type: 'click',
    });
  } catch (error) {
    console.error('Error logging search click:', error);
  }
}
