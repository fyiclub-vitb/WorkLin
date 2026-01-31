import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    writeBatch,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from './config';
import { Page, User } from '../../types/workspace';

const PAGES_COLLECTION = 'pages';
const PAGE_LINKS_COLLECTION = 'page_links';

// Links collection schema:
// {
//   sourcePageId: string;
//   targetPageId: string;
//   createdAt: Timestamp;
// }

export interface PageLink {
    id: string;
    sourcePageId: string;
    targetPageId: string;
    createdAt: any;
}

export const searchPages = async (searchTerm: string, workspaceId: string): Promise<Page[]> => {
    try {
        // Simple prefix search on title - Firestore doesn't support full text search natively
        // We fetch recent pages in workspace and filter client-side for better UX in small workspaces
        // For large workspaces, we'd need Algolia or Typesense
        const q = query(
            collection(db, PAGES_COLLECTION),
            where('workspaceId', '==', workspaceId),
            orderBy('updatedAt', 'desc'),
            limit(50)
        );

        const snapshot = await getDocs(q);
        const pages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Page));

        if (!searchTerm) return pages.slice(0, 10);

        const lowerTerm = searchTerm.toLowerCase();
        return pages.filter(p => p.title.toLowerCase().includes(lowerTerm));
    } catch (error) {
        console.error("Error searching pages:", error);
        return [];
    }
};

export const searchUsers = async (searchTerm: string, workspaceId?: string): Promise<User[]> => {
    // TODO: Implement proper user search. 
    // Since we don't have a reliable 'users' collection synced yet, 
    // we'll return an empty list or mock for now.
    // Ideally, query 'users' collection or workspace members.
    return [];
};

export const getBacklinks = async (pageId: string): Promise<PageLink[]> => {
    try {
        const q = query(
            collection(db, PAGE_LINKS_COLLECTION),
            where('targetPageId', '==', pageId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PageLink));
    } catch (error) {
        console.error("Error fetching backlinks:", error);
        return [];
    }
};

// Update backlinks based on content
// Expects contentHTML to contain data-page-id attributes
export const updateBacklinks = async (sourcePageId: string, contentHtml: string) => {
    try {
        // 1. Extract all targetPageIds from content
        const regex = /data-page-id="([^"]+)"/g;
        const targets = new Set<string>();
        let match;
        while ((match = regex.exec(contentHtml)) !== null) {
            targets.add(match[1]);
        }

        // 2. Get existing links from this source
        const q = query(
            collection(db, PAGE_LINKS_COLLECTION),
            where('sourcePageId', '==', sourcePageId)
        );
        const snapshot = await getDocs(q);
        const existingLinks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PageLink));
        const existingTargets = new Set(existingLinks.map(l => l.targetPageId));

        const batch = writeBatch(db);
        let changed = false;

        // 3. Delete removed links
        existingLinks.forEach(link => {
            if (!targets.has(link.targetPageId)) {
                batch.delete(doc(db, PAGE_LINKS_COLLECTION, link.id));
                changed = true;
            }
        });

        // 4. Add new links
        targets.forEach(targetId => {
            if (!existingTargets.has(targetId)) {
                const newRef = doc(collection(db, PAGE_LINKS_COLLECTION));
                batch.set(newRef, {
                    sourcePageId,
                    targetPageId: targetId,
                    createdAt: serverTimestamp()
                });
                changed = true;
            }
        });

        if (changed) {
            await batch.commit();
        }
    } catch (error) {
        // Silent fail safely
        console.error("Error updating backlinks:", error);
    }
};
