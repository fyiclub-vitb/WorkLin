import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// Values are loaded from .env file for security
// Fallback values provided for development
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCU849NU6c6Hgm-IIAPn3NbqBDJk6ISX3I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "worklin-4e0fb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "worklin-4e0fb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "worklin-4e0fb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "668671264022",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:668671264022:web:7487d89b840ca4c1447c37",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N47NWE95ZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize and export all Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
// Firebase Storage removed - using Cloudinary instead (see src/lib/storage/cloudinary.ts)
// export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;