import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './config';
import { addToQueue } from '../offline/queue';

const PAGES_COLLECTION = 'pages';

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

// Move page to trash (archive)
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

// Restore page from trash
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

// Permanently delete page (only for archived pages)
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