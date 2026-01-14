import { collection, query, where, orderBy, getDocs, Timestamp, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
const PAGES_COLLECTION = 'pages';
const SAVED_SEARCHES_COLLECTION = 'saved_searches';
export const searchPages = async (filters) => {
    try {
        const pagesRef = collection(db, PAGES_COLLECTION);
        // Base Query: Filter by Workspace
        // We will fetch more results and filter client-side to handle case-insensitivity and complex inequality combinations
        // efficiently enough for typical workspace sizes.
        let q = query(pagesRef, where('workspaceId', '==', filters.workspaceId), orderBy('updatedAt', 'desc'));
        // Apply strict equality filters that don't interfere with ordering
        if (filters.authorId) {
            q = query(q, where('createdBy', '==', filters.authorId));
        }
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        // We skip 'tags' in DB query if we want to be safe about indexes, or we apply it if we are sure.
        // Let's apply client-side for maximum flexibility with the text search.
        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // --- Client Side Filtering ---
        // 1. Text Search (Case-insensitive)
        if (filters.query) {
            const lowerQuery = filters.query.toLowerCase();
            results = results.filter(page => {
                const titleMatch = page.title?.toLowerCase().includes(lowerQuery);
                // We could also check plain text content if we had it easily available on the page object
                return titleMatch;
            });
        }
        // 2. Tags Filter
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(page => page.tags && filters.tags.every(tag => page.tags.includes(tag)));
        }
        // 3. Date Range Filter
        if (filters.dateRange?.start || filters.dateRange?.end) {
            const start = filters.dateRange.start ? filters.dateRange.start.getTime() : 0;
            const end = filters.dateRange.end ? filters.dateRange.end.getTime() : Infinity;
            results = results.filter(page => {
                // Handle Firestore Timestamp or Date object
                const pageDate = page.updatedAt instanceof Timestamp
                    ? page.updatedAt.toDate().getTime()
                    : new Date(page.updatedAt).getTime();
                return pageDate >= start && pageDate <= end;
            });
        }
        return { pages: results, error: null };
    }
    catch (error) {
        console.error("Search error:", error);
        return { pages: [], error: error.message };
    }
};
export const saveSearchQuery = async (userId, name, filters) => {
    try {
        const searchData = {
            userId,
            name,
            filters,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, SAVED_SEARCHES_COLLECTION), searchData);
        return { id: docRef.id, ...searchData, error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const getSavedSearches = async (userId) => {
    try {
        const q = query(collection(db, SAVED_SEARCHES_COLLECTION), where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const sn = await getDocs(q);
        const searches = sn.docs.map(d => ({ id: d.id, ...d.data() }));
        return { searches, error: null };
    }
    catch (error) {
        return { searches: [], error: error.message };
    }
};
export const deleteSavedSearch = async (searchId) => {
    try {
        await deleteDoc(doc(db, SAVED_SEARCHES_COLLECTION, searchId));
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
