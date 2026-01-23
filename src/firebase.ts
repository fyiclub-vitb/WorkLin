// Firebase bootstrap for the frontend entrypoint.
//
// Note: There is also `src/lib/firebase/config.ts` which exports Firestore/Auth/
// Functions references used throughout the app.
// This file is the minimal init used by `src/main.tsx`.

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Note: Using environment variables for security. Values are in .env file
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

// Analytics is optional; keeping the reference here makes it easy to remove in forks.
// We don't always call Analytics directly, but initialization wires up automatic events.
void getAnalytics(app);

export default app;