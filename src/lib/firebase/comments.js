import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from './config';
const COMMENTS_COLLECTION = 'comments';
// Add a new comment to a block
export const addComment = async (blockId, user, content) => {
    try {
        const commentData = {
            blockId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userPhotoURL: user.photoURL,
            content,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            resolved: false,
        };
        const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
        return { id: docRef.id, ...commentData, error: null };
    }
    catch (error) {
        console.error("Error adding comment:", error);
        return { error: error.message };
    }
};
// Toggle resolved status
export const resolveComment = async (commentId, resolved) => {
    try {
        const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
        await updateDoc(commentRef, {
            resolved,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
// Delete a comment
export const deleteComment = async (commentId) => {
    try {
        const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
        await deleteDoc(commentRef);
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
// Real-time listener for comments on a specific block
export const subscribeToComments = (blockId, callback) => {
    const q = query(collection(db, COMMENTS_COLLECTION), where('blockId', '==', blockId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(comments);
    });
};
// Get count of unresolved comments (useful for UI badges)
export const getCommentCount = async (blockId) => {
    try {
        const q = query(collection(db, COMMENTS_COLLECTION), where('blockId', '==', blockId), where('resolved', '==', false));
        const snapshot = await getDocs(q);
        return snapshot.size;
    }
    catch (error) {
        return 0;
    }
};
