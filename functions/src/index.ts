// Import necessary Firebase and third-party libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as speakeasy from 'speakeasy';

// Load environment variables from .env file when running locally
// In production, Firebase handles environment variables differently
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // If dotenv isn't installed, just continue without it
    // This prevents crashes in environments where dotenv isn't needed
  }
}

// Initialize Firebase Admin SDK
// This gives us access to Firestore, Auth, and other Firebase services
admin.initializeApp();

// Get a reference to Firestore database
const db = admin.firestore();

// In-memory storage for rate limiting
// In production, you should use Redis or Firestore instead
// This will reset every time the function cold-starts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Separate rate limiting specifically for Gemini AI API calls
// This prevents users from spamming the AI service and running up costs
const geminiRateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Configuration for Gemini API rate limits
// Adjust these values based on your API quota and budget
const GEMINI_RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 15,  // Maximum 15 AI requests per user per minute
  WINDOW_MS: 60000,         // Time window in milliseconds (60000ms = 1 minute)
};

// Helper function to extract the real IP address from the request
// Handles cases where the request goes through proxies or load balancers
function getClientIP(req: functions.https.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    // If there are multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  // Fallback to direct IP if x-forwarded-for isn't available
  return req.ip || 'unknown';
}

// General rate limiting function
// Limits users to 60 requests per minute to prevent abuse
function checkRateLimit(userId: string, ip: string): boolean {
  // Create a unique key combining user ID and IP
  const key = `${userId}:${ip}`;
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  // If no limit exists or the time window expired, create a new one
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }

  // If user has made 60 or more requests, deny the request
  if (limit.count >= 60) {
    return false;
  }

  // Increment the counter and allow the request
  limit.count++;
  return true;
}

// Rate limiting specifically for Gemini AI API calls
// This is separate from general rate limiting to give more control
function checkGeminiRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = geminiRateLimitMap.get(userId);

  // If no limit exists or the time window expired, create a new one
  if (!limit || now > limit.resetTime) {
    geminiRateLimitMap.set(userId, { 
      count: 1, 
      resetTime: now + GEMINI_RATE_LIMIT.WINDOW_MS 
    });
    return true;
  }

  // If user exceeded their AI request limit, deny the request
  if (limit.count >= GEMINI_RATE_LIMIT.REQUESTS_PER_MINUTE) {
    return false;
  }

  // Increment counter and allow the request
  limit.count++;
  return true;
}

// Cloud Function to log audit events
// This tracks all important actions in the app for security and debugging
export const logAuditEvent = functions.https.onCall(async (data, context) => {
  // Make sure the user is logged in before proceeding
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Extract user information and request metadata
  const userId = context.auth.uid;
  const ip = getClientIP(context.rawRequest);
  const userAgent = context.rawRequest.headers['user-agent'] || 'unknown';

  // Check if user is making too many requests
  if (!checkRateLimit(userId, ip)) {
    // Create a security alert for the rate limit violation
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

    // Log that we created a security alert
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

    // Reject the request with an error
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    );
  }

  // Create the audit log entry with all relevant information
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

  // Save the audit log to Firestore
  await db.collection('auditLogs').add(auditLog);

  return { success: true };
});

// Import Google's Generative AI library for the Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

// Cloud Function to process AI writing tasks
// This handles summarization, translation, tone adjustment, and text improvement
export const processAIAction = functions
  .https.onCall(async (data, context) => {
    // Step 1: Make sure the user is logged in
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const { prompt, task, targetLanguage, tone } = data.data;

    // Step 2: Check if user is within their AI request rate limit
    if (!checkGeminiRateLimit(userId)) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Maximum ${GEMINI_RATE_LIMIT.REQUESTS_PER_MINUTE} AI requests per minute. Please try again later.`
      );
    }

    // Step 3: Get the Gemini API key from environment variables
    // Make sure to set GEMINI_API_KEY in your .env file or Firebase config
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      throw new functions.https.HttpsError(
        'failed-precondition', 
        'AI API Key is not configured on the server. Please contact the administrator.'
      );
    }

    // Step 4: Validate that the prompt isn't empty
    if (!prompt || prompt.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt cannot be empty');
    }

    // Step 5: Make sure the prompt isn't too long to prevent abuse and API costs
    const MAX_PROMPT_LENGTH = 10000;
    if (prompt.length > MAX_PROMPT_LENGTH) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        `Prompt is too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.`
      );
    }

    try {
      // Initialize the Gemini AI client with our API key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Step 6: Build the system prompt based on the requested task
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

      // Combine the system prompt with the user's text
      const finalPrompt = `${systemPrompt}\n\n"${prompt}"\n\nReturn ONLY the revised text.`;

      // Step 7: Call the Gemini API with a 30 second timeout
      // If the API doesn't respond in time, we cancel the request
      const result = await Promise.race([
        model.generateContent(finalPrompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ]) as any;

      const response = await result.response;
      const text = response.text();

      // Step 8: Log the successful AI request for monitoring and analytics
      await db.collection('aiUsageLogs').add({
        userId,
        task,
        promptLength: prompt.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'SUCCESS',
      });

      // Return the AI-generated text to the user
      return { text };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Log the failed AI request
      await db.collection('aiUsageLogs').add({
        userId,
        task,
        promptLength: prompt.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'FAILED',
        error: error.message || 'Unknown error',
      });

      // Handle specific error types with user-friendly messages
      if (error.message?.includes('timeout')) {
        throw new functions.https.HttpsError('deadline-exceeded', 'AI request timed out. Please try again.');
      }
      
      if (error.message?.includes('API key') || error.message?.includes('quota')) {
        throw new functions.https.HttpsError(
          'failed-precondition', 
          'AI service is temporarily unavailable. Please try again later.'
        );
      }

      // Generic error message for any other failures
      throw new functions.https.HttpsError('internal', 'AI Service failed to process the request. Please try again.');
    }
  });

// Cloud Function to generate a 2FA secret for a user
// This creates the secret key needed for authenticator apps like Google Authenticator
export const generate2FASecret = functions.https.onCall(async (data, context) => {
  // Make sure the user is logged in
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email || 'user@example.com';

  // Generate a new 2FA secret using speakeasy library
  const secret = speakeasy.generateSecret({
    name: `WorkLin (${userEmail})`,  // This shows up in the authenticator app
    issuer: 'WorkLin',               // Company/app name
    length: 32,                      // Length of the secret (more is more secure)
  });

  // Store the secret in Firestore but don't enable 2FA yet
  // User needs to verify the code first before we enable it
  await db.collection('userSecurity').doc(userId).set(
    {
      twoFASecret: secret.base32,
      twoFAEnabled: false,
    },
    { merge: true }  // merge: true means we don't overwrite other fields
  );

  // Return the secret and QR code URL to the user
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
});

// Cloud Function to verify a 2FA code entered by the user
// This checks if the 6-digit code from their authenticator app is correct
export const verify2FAToken = functions.https.onCall(async (data, context) => {
  // Make sure the user is logged in
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { code, secret } = data;

  // Make sure we have both the code and secret
  if (!code || !secret) {
    throw new functions.https.HttpsError('invalid-argument', 'Code and secret are required');
  }

  // Get the stored secret from Firestore
  const userSecurityDoc = await db.collection('userSecurity').doc(userId).get();
  const storedSecret = userSecurityDoc.data()?.twoFASecret;

  // Use the provided secret during setup, or the stored secret for login
  const secretToVerify = secret || storedSecret;

  if (!secretToVerify) {
    throw new functions.https.HttpsError('failed-precondition', '2FA secret not found');
  }

  // Verify the 6-digit code using speakeasy
  const verified = speakeasy.totp.verify({
    secret: secretToVerify,
    encoding: 'base32',
    token: code,
    window: 2,  // Allow 2 time steps of tolerance (60 seconds) to account for clock drift
  });

  // If verification succeeded and we're in the setup phase, enable 2FA
  if (verified) {
    if (secret && secret === storedSecret) {
      await db.collection('userSecurity').doc(userId).update({
        twoFAEnabled: true,
        last2FAVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // Return whether the code was valid or not
  return { valid: verified };
});

// Cloud Function to disable 2FA for a user
// Requires the user to provide a valid 2FA code before disabling
export const disable2FA = functions.https.onCall(async (data, context) => {
  // Make sure the user is logged in
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { code } = data;

  // Make sure they provided a verification code
  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'Verification code is required');
  }

  // Get the user's security settings from Firestore
  const userSecurityDoc = await db.collection('userSecurity').doc(userId).get();
  const userSecurity = userSecurityDoc.data();

  // Make sure 2FA is actually enabled before trying to disable it
  if (!userSecurity?.twoFAEnabled || !userSecurity?.twoFASecret) {
    throw new functions.https.HttpsError('failed-precondition', '2FA is not enabled');
  }

  // Verify the code before allowing them to disable 2FA
  // This prevents someone from disabling 2FA if they steal the session
  const verified = speakeasy.totp.verify({
    secret: userSecurity.twoFASecret,
    encoding: 'base32',
    token: code,
    window: 2,
  });

  if (!verified) {
    return { success: false };
  }

  // Code was correct, so disable 2FA and remove the secret
  await db.collection('userSecurity').doc(userId).update({
    twoFAEnabled: false,
    twoFASecret: admin.firestore.FieldValue.delete(),
    last2FAVerifiedAt: admin.firestore.FieldValue.delete(),
  });

  return { success: true };
});

// Firestore trigger that runs automatically when a new audit log is created
// This detects suspicious activity patterns and creates security alerts
export const detectSuspiciousActivity = functions.firestore
  .document('auditLogs/{logId}')
  .onCreate(async (snap, context) => {
    const logData = snap.data();
    const { userId, action, status, ip } = logData;

    // Detection Rule 1: Multiple failed login attempts
    if (action === 'LOGIN' && status === 'FAILED') {
      // Look at the last 10 minutes of login attempts
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const failedLoginsQuery = await db
        .collection('auditLogs')
        .where('userId', '==', userId)
        .where('action', '==', 'LOGIN')
        .where('status', '==', 'FAILED')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(tenMinutesAgo))
        .get();

      // If there are 5 or more failed attempts, create a security alert
      if (failedLoginsQuery.size >= 5) {
        // Check if we already created an alert for this recently
        const existingAlerts = await db
          .collection('securityAlerts')
          .where('userId', '==', userId)
          .where('type', '==', 'MULTIPLE_FAILED_LOGINS')
          .where('resolved', '==', false)
          .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(tenMinutesAgo))
          .get();

        // Only create a new alert if one doesn't exist already
        if (existingAlerts.empty) {
          // Create the security alert
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

          // Log that we created a security alert
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

    // Detection Rule 2: Login from a new IP address
    if (action === 'LOGIN' && status === 'SUCCESS') {
      // Get the user's security document to check their last login IP
      const userSecurityRef = db.collection('userSecurity').doc(userId);
      const userSecurityDoc = await userSecurityRef.get();
      const userSecurity = userSecurityDoc.data();

      // If they have a previous IP and it's different from the current one
      if (userSecurity?.lastLoginIp && userSecurity.lastLoginIp !== ip) {
        // Create a security alert for the new IP login
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

        // Log that we created a security alert
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

      // Update the user's last login information
      await userSecurityRef.set(
        {
          lastLoginIp: ip,
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  });

/**
 * Firestore trigger: Index page for full-text search when created or updated
 */
export const indexPageForSearch = functions.firestore
  .document('pages/{pageId}')
  .onWrite(async (change, context) => {
    const pageId = context.params.pageId;
    const pageData = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;

    // If page was deleted, remove from index
    if (!pageData && previousData) {
      try {
        await db.collection('search_index').doc(pageId).delete();
        console.log(`Removed page ${pageId} from search index`);
      } catch (error) {
        console.error(`Error removing page ${pageId} from search index:`, error);
      }
      return;
    }

    // Skip if page is archived
    if (pageData?.isArchived) {
      try {
        await db.collection('search_index').doc(pageId).delete();
        console.log(`Removed archived page ${pageId} from search index`);
      } catch (error) {
        console.error(`Error removing archived page ${pageId} from search index:`, error);
      }
      return;
    }

    // Index or update the page
    if (pageData) {
      try {
        // Extract text content from blocks
        const blocks = pageData.blocks || [];
        const contentParts: string[] = [];
        
        blocks.forEach((block: any) => {
          let blockText = '';
          
          if (block.text) {
            blockText += block.text + ' ';
          }
          
          if (block.content) {
            // Strip HTML tags
            const plainText = block.content
              .replace(/<[^>]*>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\s+/g, ' ')
              .trim();
            blockText += plainText + ' ';
          }
          
          if (block.properties) {
            Object.values(block.properties).forEach((value: any) => {
              if (typeof value === 'string') {
                blockText += value + ' ';
              } else if (Array.isArray(value)) {
                value.forEach((item: any) => {
                  if (typeof item === 'string') {
                    blockText += item + ' ';
                  }
                });
              }
            });
          }
          
          if (blockText.trim()) {
            contentParts.push(blockText.trim());
          }
        });

        const fullContent = contentParts.join(' ');
        
        // Normalize text for fuzzy matching
        const normalizeText = (text: string): string => {
          return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        // Extract keywords
        const extractKeywords = (text: string): string[] => {
          const words = normalizeText(text)
            .split(/\s+/)
            .filter(word => word.length >= 3);
          
          const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
            'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
          ]);
          
          return Array.from(new Set(words.filter(word => !stopWords.has(word))));
        };

        const title = pageData.title || 'Untitled';
        const normalizedTitle = normalizeText(title);
        const normalizedContent = normalizeText(fullContent);
        const allText = `${title} ${fullContent}`;
        const keywords = extractKeywords(allText);

        // Create search index entry
        const indexEntry = {
          pageId,
          workspaceId: pageData.workspaceId || '',
          title,
          content: fullContent,
          tags: pageData.tags || [],
          type: pageData.type || 'document',
          createdBy: pageData.createdBy || null,
          updatedAt: pageData.updatedAt || admin.firestore.FieldValue.serverTimestamp(),
          indexedAt: admin.firestore.FieldValue.serverTimestamp(),
          normalizedTitle,
          normalizedContent,
          keywords,
        };

        await db.collection('search_index').doc(pageId).set(indexEntry, { merge: true });
        console.log(`Indexed page ${pageId} for search`);
      } catch (error) {
        console.error(`Error indexing page ${pageId}:`, error);
      }
    }
  });
