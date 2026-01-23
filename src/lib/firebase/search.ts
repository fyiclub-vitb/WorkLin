import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    addDoc,
    serverTimestamp,
    doc,
    deleteDoc,
    limit
} from 'firebase/firestore';
import { db } from './config';
import { Page } from '../../types/workspace';

// Search is implemented as a Firestore query + client-side refinement.
//
// Why not do it all in Firestore?
// - Case-insensitive text search isn’t supported without an external index.
// - Combining multiple inequality filters can require a lot of composite indexes.
//
// This is good enough for typical workspace sizes. If we need true full-text
// search later, plug in Algolia/Meilisearch/Firestore extensions.

const PAGES_COLLECTION = 'pages';
const SAVED_SEARCHES_COLLECTION = 'saved_searches';

export interface SearchFilters {
    query?: string;
    dateRange?: {
        start: Date | null;
        end: Date | null;
    };
    authorId?: string;
    type?: string;
    tags?: string[];
    workspaceId: string;
}

export interface SearchResult {
    pages: Page[];
    error: string | null;
}

export const searchPages = async (filters: SearchFilters): Promise<SearchResult> => {
    try {
        const pagesRef = collection(db, PAGES_COLLECTION);

        // Base Query: Filter by Workspace.
        // We fetch and then filter client-side for the flexible parts.
        let q = query(
            pagesRef,
            where('workspaceId', '==', filters.workspaceId),
            orderBy('updatedAt', 'desc')
        );

        // Apply strict equality filters that don't interfere with ordering.
        if (filters.authorId) {
            q = query(q, where('createdBy', '==', filters.authorId));
        }

        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }

        // Tags and text query are applied client-side to avoid index explosion.

        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));

        // --- Client Side Filtering ---

        // 1. Text Search (Case-insensitive)
        if (filters.query) {
            const lowerQuery = filters.query.toLowerCase();
            results = results.filter(page => {
                const titleMatch = page.title?.toLowerCase().includes(lowerQuery);
                // We could also search extracted plain-text content if we store it.
                return titleMatch;
            });
        }

        // 2. Tags Filter
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(page =>
                page.tags && filters.tags!.every(tag => page.tags!.includes(tag))
            );
        }

        // 3. Date Range Filter
        if (filters.dateRange?.start || filters.dateRange?.end) {
            const start = filters.dateRange.start ? filters.dateRange.start.getTime() : 0;
            const end = filters.dateRange.end ? filters.dateRange.end.getTime() : Infinity;

            results = results.filter(page => {
                // updatedAt can be a Firestore Timestamp or a serialized value.
                const pageDate = page.updatedAt instanceof Timestamp
                    ? page.updatedAt.toDate().getTime()
                    : new Date(page.updatedAt).getTime();
                return pageDate >= start && pageDate <= end;
            });
        }

        return { pages: results, error: null };

    } catch (error: any) {
        console.error("Search error:", error);
        return { pages: [], error: error.message };
    }
};

// Saved searches are just named filter presets per user.
// These are stored so the UI can show "Recent" or "Pinned" searches.
export interface SavedSearch {
    id: string;
    name: string;
    filters: Omit<SearchFilters, 'workspaceId'>;
    userId: string;
    createdAt: any;
}

export const saveSearchQuery = async (userId: string, name: string, filters: Omit<SearchFilters, 'workspaceId'>) => {
    try {
        const searchData = {
            userId,
            name,
            filters,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, SAVED_SEARCHES_COLLECTION), searchData);
        return { id: docRef.id, ...searchData, error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}

export const getSavedSearches = async (userId: string) => {
    try {
        const q = query(collection(db, SAVED_SEARCHES_COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const sn = await getDocs(q);
        const searches = sn.docs.map(d => ({ id: d.id, ...d.data() } as SavedSearch));
        return { searches, error: null };
    } catch (error: any) {
        return { searches: [], error: error.message };
    }
}

export const deleteSavedSearch = async (searchId: string) => {
    try {
        await deleteDoc(doc(db, SAVED_SEARCHES_COLLECTION, searchId));
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}
