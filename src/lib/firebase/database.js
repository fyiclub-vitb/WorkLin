import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, writeBatch, } from 'firebase/firestore';
import { db } from './config';
// Collections
const WORKSPACES_COLLECTION = 'workspaces';
const PAGES_COLLECTION = 'pages';
const BLOCKS_COLLECTION = 'blocks';
// Workspace operations
export const createWorkspace = async (userId, workspaceData) => {
    try {
        const workspaceRef = doc(db, WORKSPACES_COLLECTION);
        const workspace = {
            ...workspaceData,
            id: workspaceRef.id,
            ownerId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            members: [userId],
        };
        await setDoc(workspaceRef, workspace);
        return { workspace, error: null };
    }
    catch (error) {
        return { workspace: null, error: error.message };
    }
};
export const getWorkspace = async (workspaceId) => {
    try {
        const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
        const workspaceSnap = await getDoc(workspaceRef);
        if (workspaceSnap.exists()) {
            return { workspace: { id: workspaceSnap.id, ...workspaceSnap.data() }, error: null };
        }
        return { workspace: null, error: 'Workspace not found' };
    }
    catch (error) {
        return { workspace: null, error: error.message };
    }
};
export const updateWorkspace = async (workspaceId, updates) => {
    try {
        const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
        await updateDoc(workspaceRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const subscribeToWorkspace = (workspaceId, callback) => {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    return onSnapshot(workspaceRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        }
    });
};
// Page operations
export const createPage = async (workspaceId, pageData) => {
    try {
        const pageRef = doc(collection(db, PAGES_COLLECTION));
        const page = {
            ...pageData,
            id: pageRef.id,
            workspaceId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            blocks: [],
        };
        await setDoc(pageRef, page);
        return { page, error: null };
    }
    catch (error) {
        return { page: null, error: error.message };
    }
};
export const getPage = async (pageId) => {
    try {
        const pageRef = doc(db, PAGES_COLLECTION, pageId);
        const pageSnap = await getDoc(pageRef);
        if (pageSnap.exists()) {
            return { page: { id: pageSnap.id, ...pageSnap.data() }, error: null };
        }
        return { page: null, error: 'Page not found' };
    }
    catch (error) {
        return { page: null, error: error.message };
    }
};
export const getPagesByWorkspace = async (workspaceId) => {
    try {
        const q = query(collection(db, PAGES_COLLECTION), where('workspaceId', '==', workspaceId), orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const pages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { pages, error: null };
    }
    catch (error) {
        return { pages: [], error: error.message };
    }
};
export const updatePage = async (pageId, updates) => {
    try {
        const pageRef = doc(db, PAGES_COLLECTION, pageId);
        await updateDoc(pageRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const deletePage = async (pageId) => {
    try {
        const pageRef = doc(db, PAGES_COLLECTION, pageId);
        await deleteDoc(pageRef);
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const subscribeToPage = (pageId, callback) => {
    const pageRef = doc(db, PAGES_COLLECTION, pageId);
    return onSnapshot(pageRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() });
        }
    });
};
// Block operations
export const createBlock = async (pageId, blockData) => {
    try {
        const blockRef = doc(collection(db, BLOCKS_COLLECTION));
        const block = {
            ...blockData,
            id: blockRef.id,
            pageId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        await setDoc(blockRef, block);
        return { block, error: null };
    }
    catch (error) {
        return { block: null, error: error.message };
    }
};
export const getBlocksByPage = async (pageId) => {
    try {
        const q = query(collection(db, BLOCKS_COLLECTION), where('pageId', '==', pageId), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const blocks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { blocks, error: null };
    }
    catch (error) {
        return { blocks: [], error: error.message };
    }
};
export const updateBlock = async (blockId, updates) => {
    try {
        const blockRef = doc(db, BLOCKS_COLLECTION, blockId);
        await updateDoc(blockRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const deleteBlock = async (blockId) => {
    try {
        const blockRef = doc(db, BLOCKS_COLLECTION, blockId);
        await deleteDoc(blockRef);
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const updateBlocksBatch = async (updates) => {
    try {
        const batch = writeBatch(db);
        updates.forEach(({ blockId, updates }) => {
            const blockRef = doc(db, BLOCKS_COLLECTION, blockId);
            batch.update(blockRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            });
        });
        await batch.commit();
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const subscribeToBlocks = (pageId, callback) => {
    const q = query(collection(db, BLOCKS_COLLECTION), where('pageId', '==', pageId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const blocks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(blocks);
    });
};
