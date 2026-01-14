import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
const PAGES_COLLECTION = 'pages';
export const createPage = async (userId) => {
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
    }
    catch (error) {
        return { id: null, error: error.message };
    }
};
export const updatePage = async (pageId, data) => {
    try {
        const pageRef = doc(db, PAGES_COLLECTION, pageId);
        await updateDoc(pageRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        return { error: null };
    }
    catch (error) {
        console.error("Error updating page:", error);
        return { error: error.message };
    }
};
export const deletePage = async (pageId) => {
    try {
        // Ideally, you should also delete all blocks associated with this page here
        await deleteDoc(doc(db, PAGES_COLLECTION, pageId));
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
