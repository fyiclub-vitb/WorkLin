/**
 * @deprecated Firebase Storage is no longer used.
 * Use Cloudinary instead: import from '../storage/cloudinary'
 * 
 * This file is kept for reference only and will not work
 * since Firebase Storage has been removed from config.
 */
/*
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, error: null };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
};

export const uploadImage = async (file: File, workspaceId: string) => {
  const path = `workspaces/${workspaceId}/images/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
};

export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
*/