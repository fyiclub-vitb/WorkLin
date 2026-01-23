/**
 * Utility functions for search functionality (Client-Side)
 * 
 * Note: All search operations are now client-side using MiniSearch.
 * No Firestore writes required - compatible with Firebase Spark/free tier.
 */

import { buildSearchDocuments } from './indexing';
import { Page } from '../../types/workspace';

/**
 * Build search documents from workspace pages
 * This is a pure function - no side effects, no Firestore writes
 * Useful for preparing pages for search indexing
 */
export function buildWorkspaceSearchDocuments(
  pages: Page[],
  workspaceId: string
): ReturnType<typeof buildSearchDocuments> {
  const pagesWithWorkspace = pages
    .filter(p => !p.isArchived)
    .map(page => ({ ...page, workspaceId }));
  
  return buildSearchDocuments(pagesWithWorkspace);
}
