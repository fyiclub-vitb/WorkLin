import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Firebase client initialization.
//
// In production you should provide real values via Vite env vars.
// The fallback values below are mainly for local/demo builds and should not be
// treated as secrets (Firebase client config is public by design).
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

// Analytics is optional; SSR or restricted environments can throw.
// If that becomes an issue, gate it behind a runtime check.
export const analytics = getAnalytics(app);

// Initialize and export all Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
// Firebase Storage removed - using Cloudinary instead (see src/lib/storage/cloudinary.ts)
// export const storage = getStorage(app);

// Functions are used for optional "server-side" features (audit logs, 2FA, AI wrappers).
export const functions = getFunctions(app);

export default app;