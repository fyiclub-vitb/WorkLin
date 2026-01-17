// @ts-ignore - firebase/functions types may not be available in some Firebase versions
import { httpsCallable } from 'firebase/functions';
import { functions, auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Callable function references
 */
const generate2FASecretCallable = httpsCallable<{}, { secret: string; otpauthUrl: string }>(
  functions,
  'generate2FASecret'
);

const verify2FATokenCallable = httpsCallable<
  { code: string; secret: string },
  { valid: boolean }
>(functions, 'verify2FAToken');

const disable2FACallable = httpsCallable<{ code: string }, { success: boolean }>(
  functions,
  'disable2FA'
);

/**
 * Generate a 2FA secret and return the otpauth URL for QR code generation
 * @returns Object containing secret and otpauth URL
 */
export const enable2FA = async (): Promise<{ secret: string; otpauthUrl: string }> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to enable 2FA');
  }

  try {
    const result = await generate2FASecretCallable();
    return {
      secret: result.data.secret,
      otpauthUrl: result.data.otpauthUrl,
    };
  } catch (error: any) {
    if (error.code === 'functions/not-found' || error.message?.includes('not found')) {
      throw new Error('2FA feature requires Firebase Functions to be deployed. This is an optional security feature.');
    }
    throw error;
  }
};

/**
 * Verify a TOTP code and enable 2FA if valid
 * @param code The 6-digit TOTP code
 * @param secret The secret returned from enable2FA
 * @returns true if code is valid and 2FA is enabled
 */
export const verify2FA = async (code: string, secret: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to verify 2FA');
  }

  try {
    const result = await verify2FATokenCallable({ code, secret });
    return result.data.valid;
  } catch (error: any) {
    if (error.code === 'functions/not-found' || error.message?.includes('not found')) {
      throw new Error('2FA feature requires Firebase Functions to be deployed. This is an optional security feature.');
    }
    throw error;
  }
};

/**
 * Disable 2FA for the current user
 * Requires a valid TOTP code
 * @param code The 6-digit TOTP code
 * @returns true if successfully disabled
 */
export const disable2FA = async (code: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to disable 2FA');
  }

  try {
    const result = await disable2FACallable({ code });
    return result.data.success;
  } catch (error: any) {
    if (error.code === 'functions/not-found' || error.message?.includes('not found')) {
      throw new Error('2FA feature requires Firebase Functions to be deployed. This is an optional security feature.');
    }
    throw error;
  }
};

/**
 * Check if 2FA is enabled for the current user
 * @returns true if 2FA is enabled
 */
export const is2FAEnabled = async (): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }

  try {
    const userSecurityRef = doc(db, 'userSecurity', user.uid);
    const userSecuritySnap = await getDoc(userSecurityRef);
    
    if (!userSecuritySnap.exists()) {
      return false;
    }

    const data = userSecuritySnap.data();
    return data.twoFAEnabled === true;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
};

/**
 * Get user security settings
 */
export const getUserSecurity = async () => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    const userSecurityRef = doc(db, 'userSecurity', user.uid);
    const userSecuritySnap = await getDoc(userSecurityRef);
    
    if (!userSecuritySnap.exists()) {
      return {
        twoFAEnabled: false,
        lastLoginAt: null,
        lastLoginIp: null,
        trustedDevices: [],
        suspiciousFlags: [],
      };
    }

    return userSecuritySnap.data();
  } catch (error) {
    console.error('Error fetching user security:', error);
    return null;
  }
};

