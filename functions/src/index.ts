import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as speakeasy from 'speakeasy';

// Load environment variables from .env file (for local development)
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not installed, continue without it
  }
}

admin.initializeApp();

const db = admin.firestore();

/**
 * Rate limiting map (in production, use Redis or similar)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Gemini API rate limiting map (separate from general rate limiting)
 * Limits: 15 requests per minute per user (configurable)
 */
const geminiRateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Gemini API rate limit configuration
const GEMINI_RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 15, // 15 requests per minute per user
  WINDOW_MS: 60000, // 1 minute window
};

/**
 * Get client IP from request
 */
function getClientIP(req: functions.https.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

/**
 * Check rate limit
 */
function checkRateLimit(userId: string, ip: string): boolean {
  const key = `${userId}:${ip}`;
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 60) {
    // Rate limit exceeded
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Check Gemini API rate limit
 * Returns true if request is allowed, false if rate limit exceeded
 */
function checkGeminiRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = geminiRateLimitMap.get(userId);

  if (!limit || now > limit.resetTime) {
    geminiRateLimitMap.set(userId, { 
      count: 1, 
      resetTime: now + GEMINI_RATE_LIMIT.WINDOW_MS 
    });
    return true;
  }

  if (limit.count >= GEMINI_RATE_LIMIT.REQUESTS_PER_MINUTE) {
    // Rate limit exceeded
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Callable function: Log audit event
 * Extracts IP and userAgent from request headers
 */
export const logAuditEvent = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const ip = getClientIP(context.rawRequest);
  const userAgent = context.rawRequest.headers['user-agent'] || 'unknown';

  // Rate limiting
  if (!checkRateLimit(userId, ip)) {
    // Create security alert for rate limit
    await db.collection('securityAlerts').add({
      userId,
      type: 'RATE_LIMIT',
      severity: 'HIGH',
      ip,
      userAgent,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { action: data.action },
      resolved: false,
    });

    // Log the alert creation
    await db.collection('auditLogs').add({
      userId: 'system',
      actorRole: 'system',
      action: 'SECURITY_ALERT_CREATED',
      status: 'SUCCESS',
      ip,
      userAgent,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { alertType: 'RATE_LIMIT', targetUserId: userId },
    });

    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    );
  }

  // Create audit log entry
  const auditLog = {
    userId,
    actorRole: data.actorRole || 'user',
    action: data.action,
    entityType: data.entityType || null,
    entityId: data.entityId || null,
    status: data.status || 'SUCCESS',
    ip,
    userAgent,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    metadata: data.metadata || {},
  };

  await db.collection('auditLogs').add(auditLog);

  return { success: true };

});

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Callable function: Process AI Writing Actions
 * Uses Gemini API key directly from environment variables
 * Includes rate limiting to prevent abuse
 */
export const processAIAction = functions
  .https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const { prompt, task, targetLanguage, tone } = data.data;

    // 2. Rate Limiting Check (Gemini API specific)
    if (!checkGeminiRateLimit(userId)) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Maximum ${GEMINI_RATE_LIMIT.REQUESTS_PER_MINUTE} AI requests per minute. Please try again later.`
      );
    }

    // 3. Get API Key directly from environment variables
    // Set GEMINI_API_KEY in .env file (local) or Firebase Functions config (production)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      throw new functions.https.HttpsError(
        'failed-precondition', 
        'AI API Key is not configured on the server. Please contact the administrator.'
      );
    }

    // 4. Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt cannot be empty');
    }

    // 5. Validate prompt length (prevent abuse)
    const MAX_PROMPT_LENGTH = 10000; // 10k characters max
    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        `Prompt is too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`
      );
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // 6. Build the System Prompt (Inspired by MindTrace's llm_evaluator logic)
      let systemPrompt = "";
      switch (task) {
        case 'summarize':
          systemPrompt = "Summarize the following text concisely while keeping the key points:";
          break;
        case 'translate':
          systemPrompt = `Translate the following text accurately into ${targetLanguage || 'English'}:`;
          break;
        case 'tone':
          systemPrompt = `Rewrite the following text to have a ${tone || 'professional'} tone:`;
          break;
        case 'improve':
          systemPrompt = "Improve the clarity, grammar, and flow of the following text while maintaining its original meaning:";
          break;
        default:
          systemPrompt = "Act as a helpful writing assistant. Respond to the following prompt:";
      }

      const finalPrompt = `${systemPrompt}\n\n"${prompt}"\n\nReturn ONLY the revised text.`;

      // 7. Generate Content with timeout
      const result = await Promise.race([
        model.generateContent(finalPrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
        )
      ]) as any;

      const response = await result.response;
      const text = response.text();

      // 8. Log successful AI request (for monitoring)
      await db.collection('aiUsageLogs').add({
        userId,
        task,
        promptLength: prompt.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'SUCCESS',
      });

      return { text };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Log failed AI request
      await db.collection('aiUsageLogs').add({
        userId,
        task,
        promptLength: prompt.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'FAILED',
        error: error.message || 'Unknown error',
      });

      // Handle specific Gemini API errors
      if (error.message?.includes('timeout')) {
        throw new functions.https.HttpsError('deadline-exceeded', 'AI request timed out. Please try again.');
      }
      
      if (error.message?.includes('API key') || error.message?.includes('quota')) {
        throw new functions.https.HttpsError(
          'failed-precondition', 
          'AI service is temporarily unavailable. Please try again later.'
        );
      }

      throw new functions.https.HttpsError('internal', 'AI Service failed to process the request. Please try again.');
    }
  });

/**
 * Callable function: Generate 2FA secret
 */
export const generate2FASecret = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email || 'user@example.com';

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `WorkLin (${userEmail})`,
    issuer: 'WorkLin',
    length: 32,
  });

  // Store secret in userSecurity (will be enabled after verification)
  await db.collection('userSecurity').doc(userId).set(
    {
      twoFASecret: secret.base32,
      twoFAEnabled: false,
    },
    { merge: true }
  );

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
});

/**
 * Callable function: Verify 2FA token
 */
export const verify2FAToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { code, secret } = data;

  if (!code || !secret) {
    throw new functions.https.HttpsError('invalid-argument', 'Code and secret are required');
  }

  // Get stored secret from userSecurity
  const userSecurityDoc = await db.collection('userSecurity').doc(userId).get();
  const storedSecret = userSecurityDoc.data()?.twoFASecret;

  // Verify against provided secret (during setup) or stored secret
  const secretToVerify = secret || storedSecret;

  if (!secretToVerify) {
    throw new functions.https.HttpsError('failed-precondition', '2FA secret not found');
  }

  // Verify token
  const verified = speakeasy.totp.verify({
    secret: secretToVerify,
    encoding: 'base32',
    token: code,
    window: 2, // Allow 2 time steps (60 seconds) of tolerance
  });

  if (verified) {
    // If using provided secret (setup phase), enable 2FA
    if (secret && secret === storedSecret) {
      await db.collection('userSecurity').doc(userId).update({
        twoFAEnabled: true,
        last2FAVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  return { valid: verified };
});

/**
 * Callable function: Disable 2FA
 */
export const disable2FA = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { code } = data;

  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'Verification code is required');
  }

  // Get stored secret
  const userSecurityDoc = await db.collection('userSecurity').doc(userId).get();
  const userSecurity = userSecurityDoc.data();

  if (!userSecurity?.twoFAEnabled || !userSecurity?.twoFASecret) {
    throw new functions.https.HttpsError('failed-precondition', '2FA is not enabled');
  }

  // Verify token before disabling
  const verified = speakeasy.totp.verify({
    secret: userSecurity.twoFASecret,
    encoding: 'base32',
    token: code,
    window: 2,
  });

  if (!verified) {
    return { success: false };
  }

  // Disable 2FA
  await db.collection('userSecurity').doc(userId).update({
    twoFAEnabled: false,
    twoFASecret: admin.firestore.FieldValue.delete(),
    last2FAVerifiedAt: admin.firestore.FieldValue.delete(),
  });

  return { success: true };
});

/**
 * Firestore trigger: Detect suspicious activity
 * Triggered when a new audit log is created
 */
export const detectSuspiciousActivity = functions.firestore
  .document('auditLogs/{logId}')
  .onCreate(async (snap, context) => {
    const logData = snap.data();
    const { userId, action, status, ip } = logData;

    // Multiple failed logins detection
    if (action === 'LOGIN' && status === 'FAILED') {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const failedLoginsQuery = await db
        .collection('auditLogs')
        .where('userId', '==', userId)
        .where('action', '==', 'LOGIN')
        .where('status', '==', 'FAILED')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(tenMinutesAgo))
        .get();

      if (failedLoginsQuery.size >= 5) {
        // Check if alert already exists
        const existingAlerts = await db
          .collection('securityAlerts')
          .where('userId', '==', userId)
          .where('type', '==', 'MULTIPLE_FAILED_LOGINS')
          .where('resolved', '==', false)
          .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(tenMinutesAgo))
          .get();

        if (existingAlerts.empty) {
          // Create security alert
          await db.collection('securityAlerts').add({
            userId,
            type: 'MULTIPLE_FAILED_LOGINS',
            severity: 'HIGH',
            ip,
            userAgent: logData.userAgent,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { failedAttempts: failedLoginsQuery.size },
            resolved: false,
          });

          // Log the alert creation
          await db.collection('auditLogs').add({
            userId: 'system',
            actorRole: 'system',
            action: 'SECURITY_ALERT_CREATED',
            status: 'SUCCESS',
            ip,
            userAgent: logData.userAgent,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
              alertType: 'MULTIPLE_FAILED_LOGINS',
              targetUserId: userId,
            },
          });
        }
      }
    }

    // New IP login detection
    if (action === 'LOGIN' && status === 'SUCCESS') {
      const userSecurityRef = db.collection('userSecurity').doc(userId);
      const userSecurityDoc = await userSecurityRef.get();
      const userSecurity = userSecurityDoc.data();

      if (userSecurity?.lastLoginIp && userSecurity.lastLoginIp !== ip) {
        // Different IP detected
        await db.collection('securityAlerts').add({
          userId,
          type: 'NEW_IP_LOGIN',
          severity: 'MEDIUM',
          ip,
          userAgent: logData.userAgent,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            previousIp: userSecurity.lastLoginIp,
            newIp: ip,
          },
          resolved: false,
        });

        // Log the alert creation
        await db.collection('auditLogs').add({
          userId: 'system',
          actorRole: 'system',
          action: 'SECURITY_ALERT_CREATED',
          status: 'SUCCESS',
          ip,
          userAgent: logData.userAgent,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            alertType: 'NEW_IP_LOGIN',
            targetUserId: userId,
          },
        });
      }

      // Update last login info
      await userSecurityRef.set(
        {
          lastLoginIp: ip,
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  });

