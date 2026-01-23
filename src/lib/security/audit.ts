// @ts-ignore - firebase/functions types may not be available in some Firebase versions
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebase/config';

/**
 * Audit logging is a best-effort, optional feature.
 *
 * The app should keep working even if:
 * - Firebase Functions aren't deployed
 * - the user is offline
 * - a call fails due to permission / quota
 *
 * That's why errors here are swallowed by default.
 */

/**
 * Audit log action types
 */
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'DATA_EXPORT'
  | '2FA_ENABLE'
  | '2FA_DISABLE'
  | '2FA_VERIFY'
  | 'SECURITY_SETTINGS_UPDATE'
  | 'SECURITY_ALERT_CREATED'
  | 'WORKSPACE_CREATE'
  | 'WORKSPACE_UPDATE'
  | 'WORKSPACE_DELETE'
  | 'PAGE_CREATE'
  | 'PAGE_UPDATE'
  | 'PAGE_DELETE';

export type AuditStatus = 'SUCCESS' | 'FAIL' | 'BLOCKED' | 'FAILED';
export type ActorRole = 'user' | 'admin' | 'system';

/**
 * Options for logging an audit event.
 *
 * Keep `metadata` small and non-sensitive. Avoid:
 * - raw page content
 * - auth tokens
 * - full error stack traces
 */
export interface AuditLogOptions {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  status?: AuditStatus;
  metadata?: Record<string, any>;
  actorRole?: ActorRole;
}

/**
 * Callable function reference for logging audit events
 */
const logAuditEventCallable = httpsCallable<AuditLogOptions, { success: boolean }>(
  functions,
  'logAuditEvent'
);

/**
 * Log an audit event to Firestore via Cloud Function.
 *
 * The Cloud Function (server-side) can enrich the event with:
 * - IP address
 * - user agent
 * - geo / risk signals (optional)
 */
export const logAction = async (options: AuditLogOptions): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot log audit event: user not authenticated');
      return;
    }

    // Check if functions are available (optional feature)
    try {
      await logAuditEventCallable({
        ...options,
        status: options.status || 'SUCCESS',
        actorRole: options.actorRole || 'user',
      });
    } catch (funcError: any) {
      // Functions not deployed or unavailable - silently fail (optional feature)
      if (funcError.code === 'functions/not-found' || funcError.message?.includes('not found')) {
        console.debug('Audit logging function not available (optional feature)');
        return;
      }
      throw funcError;
    }
  } catch (error: any) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging failures shouldn't break the app
  }
};

/**
 * Helper: Log successful login
 */
export const logLoginSuccess = async (metadata?: Record<string, any>): Promise<void> => {
  await logAction({
    action: 'LOGIN',
    status: 'SUCCESS',
    metadata,
  });
};

/**
 * Helper: Log failed login attempt
 */
export const logLoginFailure = async (email: string, reason?: string): Promise<void> => {
  await logAction({
    action: 'LOGIN',
    status: 'FAILED',
    metadata: {
      email,
      reason: reason || 'Invalid credentials',
    },
  });
};

/**
 * Helper: Log logout
 */
export const logLogout = async (): Promise<void> => {
  await logAction({
    action: 'LOGOUT',
    status: 'SUCCESS',
  });
};

/**
 * Helper: Log profile update
 */
export const logProfileUpdate = async (
  entityId: string,
  changes: Record<string, any>
): Promise<void> => {
  await logAction({
    action: 'PROFILE_UPDATE',
    entityType: 'user',
    entityId,
    status: 'SUCCESS',
    metadata: { changes },
  });
};

/**
 * Helper: Log data export
 */
export const logExport = async (exportType: string, recordCount?: number): Promise<void> => {
  await logAction({
    action: 'DATA_EXPORT',
    status: 'SUCCESS',
    metadata: {
      exportType,
      recordCount,
    },
  });
};

/**
 * Helper: Log security-related changes
 */
export const logSecurityChange = async (
  action: AuditAction,
  metadata?: Record<string, any>
): Promise<void> => {
  await logAction({
    action,
    status: 'SUCCESS',
    metadata,
  });
};

/**
 * Wrapper that executes `fn()` and writes a SUCCESS/FAILED audit event.
 *
 * Useful for settings flows where we want a clean audit trail without duplicating
 * try/catch + logAction everywhere.
 */
export const withAudit = async <T>(
  action: AuditAction,
  fn: () => Promise<T>,
  options?: Partial<AuditLogOptions>
): Promise<T> => {
  try {
    const result = await fn();
    await logAction({
      action,
      status: 'SUCCESS',
      ...options,
    });
    return result;
  } catch (error: any) {
    await logAction({
      action,
      status: 'FAILED',
      metadata: {
        error: error.message || 'Unknown error',
        // Sanitize error - don't expose sensitive details
        errorType: error.constructor?.name || 'Error',
      },
      ...options,
    });
    throw error;
  }
};
