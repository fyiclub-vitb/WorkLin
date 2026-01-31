import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { logLoginSuccess, logLoginFailure, logLogout } from '../security/audit';

/**
 * Email/password login.
 * Returns `{ user, error }` instead of throwing so UI code can stay simple.
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Audit logs are best-effort; they should never block the login flow.
    await logLoginSuccess({ email, method: 'email' });
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    await logLoginFailure(email, error.message);
    return { user: null, error: error.message };
  }
};

/**
 * Create an account with email/password.
 * If displayName is supplied, we immediately write it to the auth profile.
 */
export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

/**
 * Google login via popup.
 * Common failure in browsers: popup blocked by the user/extension.
 */
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await logLoginSuccess({ email: userCredential.user.email, method: 'google' });
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    await logLoginFailure('google', error.message);
    return { user: null, error: error.message };
  }
};

// Export stays even if not all screens use it yet.
// (Some tooling setups flag this as "unused" because it's only imported in optional flows.)
export const logout = async () => {
  try {
    await signOut(auth);
    await logLogout();
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

/**
 * Triggers Firebase Auth's password reset email.
 * Note: this doesn't confirm whether the email exists (by design).
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Subscribe to auth state changes (login/logout/token refresh).
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
