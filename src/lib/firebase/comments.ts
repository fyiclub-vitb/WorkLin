import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './config';

export interface Comment {
  id: string;
  blockId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolved: boolean;
}

const COMMENTS_COLLECTION = 'comments';

// Add a new comment to a block
export const addComment = async (
  blockId: string, 
  user: { uid: string; displayName: string | null; photoURL: string | null }, 
  content: string
) => {
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
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return { error: error.message };
  }
};

// Toggle resolved status
export const resolveComment = async (commentId: string, resolved: boolean) => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, { 
      resolved,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Delete a comment
export const deleteComment = async (commentId: string) => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Real-time listener for comments on a specific block
export const subscribeToComments = (blockId: string, callback: (comments: Comment[]) => void) => {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('blockId', '==', blockId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
    callback(comments);
  });
};

// Get count of unresolved comments (useful for UI badges)
export const getCommentCount = async (blockId: string) => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION), 
      where('blockId', '==', blockId),
      where('resolved', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    return 0;
  }
};