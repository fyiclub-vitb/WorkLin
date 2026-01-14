import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, updateProfile, } from 'firebase/auth';
import { auth } from './config';
import { logLoginSuccess, logLoginFailure, logLogout } from '../security/audit';
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Log successful login
        await logLoginSuccess({ email, method: 'email' });
        return { user: userCredential.user, error: null };
    }
    catch (error) {
        // Log failed login
        await logLoginFailure(email, error.message);
        return { user: null, error: error.message };
    }
};
export const signUpWithEmail = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName });
        }
        return { user: userCredential.user, error: null };
    }
    catch (error) {
        return { user: null, error: error.message };
    }
};
export const loginWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        // Log successful login
        await logLoginSuccess({ email: userCredential.user.email, method: 'google' });
        return { user: userCredential.user, error: null };
    }
    catch (error) {
        // Log failed login
        await logLoginFailure('google', error.message);
        return { user: null, error: error.message };
    }
};
export const logout = async () => {
    try {
        await signOut(auth);
        // Log logout
        await logLogout();
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    }
    catch (error) {
        return { error: error.message };
    }
};
export const subscribeToAuth = (callback) => {
    return onAuthStateChanged(auth, callback);
};
export const getCurrentUser = () => {
    return auth.currentUser;
};
