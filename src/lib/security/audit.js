// @ts-ignore - firebase/functions types may not be available in some Firebase versions
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../firebase/config';
/**
 * Callable function reference for logging audit events
 */
const logAuditEventCallable = httpsCallable(functions, 'logAuditEvent');
/**
 * Log an audit event to Firestore via Cloud Function
 * The Cloud Function extracts IP and userAgent from request headers
 */
export const logAction = async (options) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn('Cannot log audit event: user not authenticated');
            return;
        }
        await logAuditEventCallable({
            ...options,
            status: options.status || 'SUCCESS',
            actorRole: options.actorRole || 'user',
        });
    }
    catch (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw - audit logging failures shouldn't break the app
    }
};
/**
 * Helper: Log successful login
 */
export const logLoginSuccess = async (metadata) => {
    await logAction({
        action: 'LOGIN',
        status: 'SUCCESS',
        metadata,
    });
};
/**
 * Helper: Log failed login attempt
 */
export const logLoginFailure = async (email, reason) => {
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
export const logLogout = async () => {
    await logAction({
        action: 'LOGOUT',
        status: 'SUCCESS',
    });
};
/**
 * Helper: Log profile update
 */
export const logProfileUpdate = async (entityId, changes) => {
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
export const logExport = async (exportType, recordCount) => {
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
export const logSecurityChange = async (action, metadata) => {
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
export const withAudit = async (action, fn, options) => {
    try {
        const result = await fn();
        await logAction({
            action,
            status: 'SUCCESS',
            ...options,
        });
        return result;
    }
    catch (error) {
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
