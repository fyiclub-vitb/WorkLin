/**
 * Utility functions for search functionality
 */

import { indexPages } from './indexing';
import { Page } from '../../types/workspace';

/**
 * Index all pages in a workspace
 * Useful for initial setup or re-indexing
 */
export async function indexWorkspacePages(
  pages: Page[],
  workspaceId: string
): Promise<{ success: number; failed: number }> {
  const pagesWithWorkspace = pages
    .filter(p => !p.isArchived)
    .map(page => ({ ...page, workspaceId }));
  
  return await indexPages(pagesWithWorkspace);
}
