import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { addToQueue } from '../offline/queue';

// Lightweight page utilities used by some parts of the UI.
//
// Note: There is a richer page API in `firebase/database.ts` that is workspace-aware.
// This module focuses on “quick page” operations and includes offline-queue wrappers.
const PAGES_COLLECTION = 'pages';

/**
 * Create a blank “Untitled Page”.
 *
 * Offline mode:
 * - We enqueue the request and return a temporary id so the UI can react immediately.
 * - The temp id is NOT automatically reconciled with the server id yet.
 */
export const createPage = async (userId: string) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'createPage', payload: { userId } });
    return { id: 'temp-' + Date.now(), error: null, offline: true };
  }
  try {
    const docRef = await addDoc(collection(db, PAGES_COLLECTION), {
      userId,
      title: 'Untitled Page',
      coverImage: null,
      icon: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isArchived: false,
    });
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

/**
 * Update a page document by id.
 *
 * `data` is intentionally untyped here because different screens patch different
 * subsets of fields (title, icon, cover, metadata...). If this stabilizes, we can
 * swap to `Partial<Page>`.
 */
export const updatePage = async (pageId: string, data: any) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'updatePage', payload: { pageId, data } });
    return { error: null, offline: true };
  }
  try {
    const pageRef = doc(db, PAGES_COLLECTION, pageId);
    await updateDoc(pageRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    console.error("Error updating page:", error);
    return { error: error.message };
  }
};

// Move page to trash (archive).
// We keep the doc around so links/history can still reference it.
export const deletePage = async (pageId: string) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'deletePage', payload: { pageId } });
    return { error: null, offline: true };
  }
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

// Restore page from trash.
export const restorePage = async (pageId: string) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'restorePage', payload: { pageId } });
    return { error: null, offline: true };
  }
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

// Permanently delete page (only for archived pages).
//
// If you call this on a non-archived page, the UI/permission layer should block it.
// Firestore itself won’t enforce that without rules.
export const permanentlyDeletePage = async (pageId: string) => {
  if (!navigator.onLine) {
    await addToQueue({ type: 'permanentlyDeletePage', payload: { pageId } });
    return { error: null, offline: true };
  }
  try {
    await deleteDoc(doc(db, PAGES_COLLECTION, pageId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};