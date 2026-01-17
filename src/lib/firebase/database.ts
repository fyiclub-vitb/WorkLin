// src/lib/firebase/database.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { Page, Block, Workspace } from '../../types/workspace';
import { addToQueue } from '../offline/queue';

/**
 * Firestore Database Access Layer (DAL)
 * * This module handles all direct interactions with Firebase Firestore.
 * * Key Features:
 * 1. CRUD Operations: Wrappers for basic Firestore actions.
 * 2. Real-time Subscriptions: onSnapshot wrappers for live UI updates.
 * 3. Offline Support: Intercepts block operations when offline and sends them 
 * to the IndexedDB queue (via `addToQueue`) for later synchronization.
 * * Collections Structure:
 * - workspaces/
 * - pages/ (contains metadata, parent references)
 * - blocks/ (contains actual content, linked by pageId)
 */

// Collection Constants
const WORKSPACES_COLLECTION = 'workspaces';
const PAGES_COLLECTION = 'pages';
const BLOCKS_COLLECTION = 'blocks';

// ==========================================
// WORKSPACE OPERATIONS
// ==========================================

/**
 * Creates a new workspace and sets the creator as the owner.
 */
export const createWorkspace = async (userId: string, workspaceData: Partial<Workspace>) => {
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
  } catch (error: any) {
    return { workspace: null, error: error.message };
  }
};

export const getWorkspace = async (workspaceId: string) => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    if (workspaceSnap.exists()) {
      return { workspace: { id: workspaceSnap.id, ...workspaceSnap.data() }, error: null };
    }
    return { workspace: null, error: 'Workspace not found' };
  } catch (error: any) {
    return { workspace: null, error: error.message };
  }
};

export const updateWorkspace = async (workspaceId: string, updates: Partial<Workspace>) => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    await updateDoc(workspaceRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Subscribes to real-time updates for a specific workspace.
 * Used to update the UI immediately when workspace settings change.
 */
export const subscribeToWorkspace = (
  workspaceId: string,
  callback: (workspace: any) => void
) => {
  const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
  return onSnapshot(workspaceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

// ==========================================
// PAGE OPERATIONS
// ==========================================

export const createPage = async (workspaceId: string, pageData: Partial<Page>) => {
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
  } catch (error: any) {
    return { page: null, error: error.message };
  }
};

export const getPage = async (pageId: string) => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, pageId);
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      return { page: { id: pageSnap.id, ...pageSnap.data() }, error: null };
    }
    return { page: null, error: 'Page not found' };
  } catch (error: any) {
    return { page: null, error: error.message };
  }
};

/**
 * Fetches all pages within a workspace, ordered by last update.
 * Note: This does not construct the hierarchy tree; that is done client-side.
 */
export const getPagesByWorkspace = async (workspaceId: string) => {
  try {
    const q = query(
      collection(db, PAGES_COLLECTION),
      where('workspaceId', '==', workspaceId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const pages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { pages, error: null };
  } catch (error: any) {
    return { pages: [], error: error.message };
  }
};

export const getPagesByParent = async (parentId: string) => {
  try {
    const q = query(
      collection(db, PAGES_COLLECTION),
      where('parentId', '==', parentId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const pages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[]; // Cast to any to avoid strict type checks on the spread
    return { pages, error: null };
  } catch (error: any) {
    return { pages: [], error: error.message };
  }
};

export const updatePage = async (pageId: string, updates: Partial<Page>) => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, pageId);
    await updateDoc(pageRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Move page to trash (soft delete)
export const deletePage = async (pageId: string) => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, pageId);
    await updateDoc(pageRef, {
      isArchived: true,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Restore page from trash
export const restorePage = async (pageId: string) => {
  try {
    const pageRef = doc(db, PAGES_COLLECTION, pageId);
    await updateDoc(pageRef, {
      isArchived: false,
      archivedAt: null,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Permanently delete page (hard delete)
export const permanentlyDeletePage = async (pageId: string) => {
  try {
    await deleteDoc(doc(db, PAGES_COLLECTION, pageId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const subscribeToPage = (pageId: string, callback: (page: any) => void) => {
  const pageRef = doc(db, PAGES_COLLECTION, pageId);
  return onSnapshot(pageRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

// ==========================================
// BLOCK OPERATIONS
// ==========================================

/**
 * Creates a new block in a page.
 * * OFFLINE HANDLING:
 * If the user is offline, this operation generates a temporary ID,
 * saves the action to the IndexedDB queue, and returns an "offline" success.
 * This ensures the UI remains responsive even without a connection.
 */
export const createBlock = async (pageId: string, blockData: Partial<Block>) => {
  if (!navigator.onLine) {
    const tempId = 'temp-block-' + Date.now();
    await addToQueue({ type: 'createBlock', payload: { pageId, blockData: { ...blockData, id: tempId } } });
    return { block: { ...blockData, id: tempId, pageId }, error: null, offline: true };
  }
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
  } catch (error: any) {
    return { block: null, error: error.message };
  }
};

export const getBlocksByPage = async (pageId: string) => {
  try {
    const q = query(
      collection(db, BLOCKS_COLLECTION),
      where('pageId', '==', pageId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const blocks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { blocks, error: null };
  } catch (error: any) {
    return { blocks: [], error: error.message };
  }
};

/**
 * Updates an existing block.
 * * OFFLINE HANDLING:
 * Similar to createBlock, if offline, queues the update.
 */
export const updateBlock = async (blockId: string, updates: Partial<Block>) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'updateBlock', payload: { blockId, updates } });
    return { error: null, offline: true };
  }
  try {
    const blockRef = doc(db, BLOCKS_COLLECTION, blockId);
    await updateDoc(blockRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteBlock = async (blockId: string) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'deleteBlock', payload: { blockId } });
    return { error: null, offline: true };
  }
  try {
    const blockRef = doc(db, BLOCKS_COLLECTION, blockId);
    await deleteDoc(blockRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Batch update for multiple blocks (e.g., when reordering).
 * Uses Firestore WriteBatch to ensure atomicity (all succeed or all fail).
 */
export const updateBlocksBatch = async (updates: Array<{ blockId: string; updates: Partial<Block> }>) => {
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
  } catch (error: any) {
    return { error: error.message };
  }
};

export const subscribeToBlocks = (pageId: string, callback: (blocks: any[]) => void) => {
  const q = query(
    collection(db, BLOCKS_COLLECTION),
    where('pageId', '==', pageId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const blocks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(blocks);
  });
};