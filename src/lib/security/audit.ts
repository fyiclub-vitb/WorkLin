// @ts-ignore - firebase/functions types may not be available in some Firebase versions
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebase/config';

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
 * Options for logging an audit event
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
 * Log an audit event to Firestore via Cloud Function
 * The Cloud Function extracts IP and userAgent from request headers
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
 * Wrapper function that executes an async function and logs the result
 * @param action The audit action name
 * @param fn The function to execute
 * @param options Additional audit log options
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

