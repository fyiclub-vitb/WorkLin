import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Firebase client initialization.
//
// In production you should provide real values via Vite env vars.
// The fallback values below are mainly for local/demo builds and should not be
// treated as secrets (Firebase client config is public by design).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics is optional; SSR or restricted environments can throw.
// If that becomes an issue, gate it behind a runtime check.
export const analytics = getAnalytics(app);

// Initialize and export all Firebase services
// experimentalForceLongPolling: true fixes net::ERR_QUIC_PROTOCOL_ERROR in some networks
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth = getAuth(app);
// Firebase Storage removed - using Cloudinary instead (see src/lib/storage/cloudinary.ts)
// export const storage = getStorage(app);

// Functions are used for optional "server-side" features (audit logs, 2FA, AI wrappers).
export const functions = getFunctions(app);

export default app;