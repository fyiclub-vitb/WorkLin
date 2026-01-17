/**
 * Webhook System (Client-Side)
 * 
 * Provides webhook management, delivery, retry logic, and logging.
 * Works entirely client-side - no Firebase billing required.
 * Compatible with Firebase Spark/free tier.
 */

import { collection, doc, getDocs, setDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { WebhookConfig, WebhookEventType, WebhookDeliveryLog, WebhookQueueJob, WebhookPayload } from '../../types/webhook';

// Collection names
const WEBHOOKS_COLLECTION = 'webhooks';
const WEBHOOK_LOGS_COLLECTION = 'webhook_logs';
const WEBHOOK_QUEUE_COLLECTION = 'webhook_queue';

// localStorage keys (fallback if Firestore unavailable)
const getWebhooksKey = (workspaceId: string) => `webhooks_${workspaceId}`;
const getWebhookLogsKey = (workspaceId: string) => `webhook_logs_${workspaceId}`;
const getWebhookQueueKey = (workspaceId: string) => `webhook_queue_${workspaceId}`;

// Retry intervals in milliseconds (exponential backoff)
const RETRY_INTERVALS = [
  1 * 60 * 1000,    // 1 minute
  5 * 60 * 1000,    // 5 minutes
  15 * 60 * 1000,   // 15 minutes
  60 * 60 * 1000,   // 1 hour
  6 * 60 * 60 * 1000, // 6 hours
];
const MAX_ATTEMPTS = 5;

// Retry worker interval
const RETRY_WORKER_INTERVAL = 30 * 1000; // 30 seconds

let retryWorkerInterval: NodeJS.Timeout | null = null;

/**
 * Check if Firestore is available (not just checking if db exists, but if we can actually use it)
 */
async function isFirestoreAvailable(): Promise<boolean> {
  try {
    // Check if db is initialized
    if (!db) {
      return false;
    }
    // Try a simple read to check if Firestore is accessible
    // Use a collection that might exist to avoid permission errors
    const testRef = collection(db, WEBHOOKS_COLLECTION);
    await getDocs(query(testRef, limit(1)));
    return true;
  } catch (error: any) {
    // If it's a permission error, Firestore is available but we don't have access
    // In that case, we'll use localStorage fallback
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      console.warn('[Webhooks] Firestore permission denied, using localStorage fallback');
      return false;
    }
    // For other errors, assume Firestore is not available
    console.warn('[Webhooks] Firestore not available, using localStorage fallback:', error?.message);
    return false;
  }
}

/**
 * Get all webhooks for a workspace
 */
export async function getWebhooks(workspaceId: string): Promise<WebhookConfig[]> {
  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const webhooksRef = collection(db, WEBHOOKS_COLLECTION);
      const q = query(webhooksRef, where('workspaceId', '==', workspaceId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as WebhookConfig;
      });
    } else {
      // localStorage fallback
      const key = getWebhooksKey(workspaceId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const webhooks = JSON.parse(stored);
        return webhooks.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
        }));
      }
      return [];
    }
  } catch (error) {
    console.error('[Webhooks] Error getting webhooks:', error);
    // Fallback to localStorage
    const key = getWebhooksKey(workspaceId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored).map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt),
        updatedAt: new Date(w.updatedAt),
      }));
    }
    return [];
  }
}

/**
 * Create a new webhook
 */
export async function createWebhook(workspaceId: string, data: Omit<WebhookConfig, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>): Promise<WebhookConfig> {
  const webhook: WebhookConfig = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    workspaceId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const webhookRef = doc(db, WEBHOOKS_COLLECTION, webhook.id);
      await setDoc(webhookRef, {
        ...webhook,
        createdAt: Timestamp.fromDate(webhook.createdAt),
        updatedAt: Timestamp.fromDate(webhook.updatedAt),
      });
    } else {
      // localStorage fallback
      const key = getWebhooksKey(workspaceId);
      const existing = await getWebhooks(workspaceId);
      existing.push(webhook);
      localStorage.setItem(key, JSON.stringify(existing));
    }
    
    return webhook;
  } catch (error) {
    console.error('[Webhooks] Error creating webhook:', error);
    // Fallback to localStorage
    const key = getWebhooksKey(workspaceId);
    const existing = await getWebhooks(workspaceId);
    existing.push(webhook);
    localStorage.setItem(key, JSON.stringify(existing));
    return webhook;
  }
}

/**
 * Update a webhook
 */
export async function updateWebhook(workspaceId: string, webhookId: string, patch: Partial<Omit<WebhookConfig, 'id' | 'workspaceId' | 'createdAt'>>): Promise<void> {
  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const webhookRef = doc(db, WEBHOOKS_COLLECTION, webhookId);
      await setDoc(webhookRef, {
        ...patch,
        updatedAt: Timestamp.fromDate(new Date()),
      }, { merge: true });
    } else {
      // localStorage fallback
      const key = getWebhooksKey(workspaceId);
      const webhooks = await getWebhooks(workspaceId);
      const index = webhooks.findIndex(w => w.id === webhookId);
      if (index !== -1) {
        webhooks[index] = {
          ...webhooks[index],
          ...patch,
          updatedAt: new Date(),
        };
        localStorage.setItem(key, JSON.stringify(webhooks));
      }
    }
  } catch (error) {
    console.error('[Webhooks] Error updating webhook:', error);
    // Fallback to localStorage
    const key = getWebhooksKey(workspaceId);
    const webhooks = await getWebhooks(workspaceId);
    const index = webhooks.findIndex(w => w.id === webhookId);
    if (index !== -1) {
      webhooks[index] = {
        ...webhooks[index],
        ...patch,
        updatedAt: new Date(),
      };
      localStorage.setItem(key, JSON.stringify(webhooks));
    }
  }
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(workspaceId: string, webhookId: string): Promise<void> {
  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const webhookRef = doc(db, WEBHOOKS_COLLECTION, webhookId);
      await deleteDoc(webhookRef);
    } else {
      // localStorage fallback
      const key = getWebhooksKey(workspaceId);
      const webhooks = await getWebhooks(workspaceId);
      const filtered = webhooks.filter(w => w.id !== webhookId);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('[Webhooks] Error deleting webhook:', error);
    // Fallback to localStorage
    const key = getWebhooksKey(workspaceId);
    const webhooks = await getWebhooks(workspaceId);
    const filtered = webhooks.filter(w => w.id !== webhookId);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

/**
 * Generate HMAC SHA-256 signature using Web Crypto API
 */
async function signPayload(secret: string, timestamp: number, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const message = encoder.encode(`${timestamp}.${payload}`);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Deliver a webhook (client-side POST request)
 */
async function deliverWebhook(
  webhook: WebhookConfig,
  eventType: WebhookEventType,
  payload: WebhookPayload
): Promise<{ success: boolean; status?: number; error?: string; durationMs: number }> {
  const startTime = Date.now();
  console.log('[deliverWebhook] Starting delivery', { webhookId: webhook.id, url: webhook.url, eventType });
  
  try {
    const timestamp = Date.now();
    const payloadString = JSON.stringify(payload);
    console.log('[deliverWebhook] Signing payload');
    const signature = await signPayload(webhook.secret, timestamp, payloadString);
    console.log('[deliverWebhook] Sending POST request to:', webhook.url);
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worklin-Event': eventType,
        'X-Worklin-Timestamp': timestamp.toString(),
        'X-Worklin-Signature': `sha256=${signature}`,
        'X-Worklin-Webhook-Id': webhook.id,
      },
      body: payloadString,
    });
    
    const durationMs = Date.now() - startTime;
    console.log('[deliverWebhook] Response received', { status: response.status, durationMs });
    
    if (response.ok) {
      return { success: true, status: response.status, durationMs };
    } else {
      return { 
        success: false, 
        status: response.status, 
        error: `HTTP ${response.status}: ${response.statusText}`,
        durationMs 
      };
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error('[deliverWebhook] Error during delivery:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      durationMs,
    };
  }
}

/**
 * Log webhook delivery attempt
 * ALWAYS writes to logs - success or failure
 */
async function logWebhookDelivery(log: Omit<WebhookDeliveryLog, 'id'>): Promise<void> {
  const deliveryLog: WebhookDeliveryLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  console.log('[logWebhookDelivery] Creating log entry', { 
    webhookId: log.webhookId, 
    eventType: log.eventType, 
    status: log.status,
    logId: deliveryLog.id 
  });

  try {
    const useFirestore = await isFirestoreAvailable();
    console.log('[logWebhookDelivery] Firestore available:', useFirestore);
    
    if (useFirestore) {
      const logRef = doc(db, WEBHOOK_LOGS_COLLECTION, deliveryLog.id);
      await setDoc(logRef, {
        ...deliveryLog,
        timestamp: Timestamp.fromDate(deliveryLog.timestamp),
      });
      console.log('[logWebhookDelivery] Log written to Firestore:', deliveryLog.id);
    } else {
      // localStorage fallback
      console.log('[logWebhookDelivery] Using localStorage fallback');
      const key = getWebhookLogsKey(log.workspaceId);
      // Read existing logs directly from localStorage (don't call getWebhookLogs to avoid circular dependency)
      const stored = localStorage.getItem(key);
      const existing: WebhookDeliveryLog[] = stored ? JSON.parse(stored) : [];
      existing.unshift(deliveryLog); // Add to beginning
      // Keep only last 1000 logs
      const trimmed = existing.slice(0, 1000);
      localStorage.setItem(key, JSON.stringify(trimmed));
      console.log('[logWebhookDelivery] Log written to localStorage, total logs:', trimmed.length);
    }
  } catch (error) {
    console.error('[logWebhookDelivery] Error logging delivery, using localStorage fallback:', error);
    // ALWAYS fallback to localStorage - never fail silently
    try {
      const key = getWebhookLogsKey(log.workspaceId);
      // Read existing logs directly from localStorage (don't call getWebhookLogs to avoid circular dependency)
      const stored = localStorage.getItem(key);
      const existing: WebhookDeliveryLog[] = stored ? JSON.parse(stored) : [];
      existing.unshift(deliveryLog);
      const trimmed = existing.slice(0, 1000);
      localStorage.setItem(key, JSON.stringify(trimmed));
      console.log('[logWebhookDelivery] Log written to localStorage (fallback), total logs:', trimmed.length);
    } catch (fallbackError) {
      console.error('[logWebhookDelivery] CRITICAL: Failed to write log even to localStorage:', fallbackError);
      // Last resort: try to store in a different key
      try {
        const emergencyKey = `webhook_logs_emergency_${log.workspaceId}`;
        const emergencyStored = localStorage.getItem(emergencyKey);
        const emergencyLogs: WebhookDeliveryLog[] = emergencyStored ? JSON.parse(emergencyStored) : [];
        emergencyLogs.unshift(deliveryLog);
        localStorage.setItem(emergencyKey, JSON.stringify(emergencyLogs.slice(0, 100)));
        console.log('[logWebhookDelivery] Log written to emergency storage');
      } catch (e) {
        console.error('[logWebhookDelivery] CRITICAL: All logging methods failed!', e);
      }
    }
  }
}

/**
 * Get webhook delivery logs
 */
export async function getWebhookLogs(workspaceId: string, limitCount: number = 100): Promise<WebhookDeliveryLog[]> {
  console.log('[getWebhookLogs] Fetching logs', { workspaceId, limitCount });
  try {
    const useFirestore = await isFirestoreAvailable();
    console.log('[getWebhookLogs] Firestore available:', useFirestore);
    
    if (useFirestore) {
      const logsRef = collection(db, WEBHOOK_LOGS_COLLECTION);
      const q = query(
        logsRef,
        where('workspaceId', '==', workspaceId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      console.log('[getWebhookLogs] Firestore logs count:', snapshot.docs.length);
      
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as WebhookDeliveryLog;
      });
      console.log('[getWebhookLogs] Returning Firestore logs:', logs.length);
      return logs;
    } else {
      // localStorage fallback
      const key = getWebhookLogsKey(workspaceId);
      const stored = localStorage.getItem(key);
      console.log('[getWebhookLogs] localStorage key:', key, 'exists:', !!stored);
      let logs: WebhookDeliveryLog[] = [];
      if (stored) {
        logs = JSON.parse(stored).slice(0, limitCount).map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp),
        }));
        console.log('[getWebhookLogs] Found localStorage logs:', logs.length);
      }
      // Also check emergency storage and merge
      const emergencyKey = `webhook_logs_emergency_${workspaceId}`;
      const emergencyStored = localStorage.getItem(emergencyKey);
      if (emergencyStored) {
        const emergencyLogs = JSON.parse(emergencyStored).slice(0, limitCount).map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp),
        }));
        console.log('[getWebhookLogs] Found emergency logs:', emergencyLogs.length);
        // Merge and sort by timestamp
        const allLogs = [...logs, ...emergencyLogs].sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ).slice(0, limitCount);
        console.log('[getWebhookLogs] Returning merged logs:', allLogs.length);
        return allLogs;
      }
      console.log('[getWebhookLogs] Returning localStorage logs:', logs.length);
      return logs;
    }
  } catch (error) {
    console.error('[getWebhookLogs] Error getting logs, using localStorage fallback:', error);
    // Fallback to localStorage
    try {
      const key = getWebhookLogsKey(workspaceId);
      const stored = localStorage.getItem(key);
      let logs: WebhookDeliveryLog[] = [];
      if (stored) {
        logs = JSON.parse(stored).slice(0, limitCount).map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp),
        }));
        console.log('[getWebhookLogs] Found localStorage logs (fallback):', logs.length);
      }
      // Also check emergency storage and merge
      const emergencyKey = `webhook_logs_emergency_${workspaceId}`;
      const emergencyStored = localStorage.getItem(emergencyKey);
      if (emergencyStored) {
        const emergencyLogs = JSON.parse(emergencyStored).slice(0, limitCount).map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp),
        }));
        console.log('[getWebhookLogs] Found emergency logs:', emergencyLogs.length);
        // Merge and sort by timestamp
        const allLogs = [...logs, ...emergencyLogs].sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        ).slice(0, limitCount);
        console.log('[getWebhookLogs] Returning merged logs (fallback):', allLogs.length);
        return allLogs;
      }
      console.log('[getWebhookLogs] Returning localStorage logs (fallback):', logs.length);
      return logs;
    } catch (fallbackError) {
      console.error('[getWebhookLogs] Fallback also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Queue a webhook for retry
 */
async function queueRetry(
  webhookId: string,
  workspaceId: string,
  eventType: WebhookEventType,
  payload: WebhookPayload,
  attempt: number,
  lastError?: string
): Promise<void> {
  if (attempt >= MAX_ATTEMPTS) {
    console.warn(`[Webhooks] Max attempts reached for webhook ${webhookId}`);
    return;
  }

  const nextRunAt = new Date(Date.now() + RETRY_INTERVALS[attempt - 1]);
  
  const job: WebhookQueueJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    webhookId,
    workspaceId,
    eventType,
    payload,
    attempt,
    nextRunAt,
    lastError,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const jobRef = doc(db, WEBHOOK_QUEUE_COLLECTION, job.id);
      await setDoc(jobRef, {
        ...job,
        nextRunAt: Timestamp.fromDate(job.nextRunAt),
        createdAt: Timestamp.fromDate(job.createdAt),
        updatedAt: Timestamp.fromDate(job.updatedAt),
      });
    } else {
      // localStorage fallback
      const key = getWebhookQueueKey(workspaceId);
      const existing = await getWebhookQueue(workspaceId);
      existing.push(job);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch (error) {
    console.error('[Webhooks] Error queueing retry:', error);
    // Fallback to localStorage
    const key = getWebhookQueueKey(workspaceId);
    const existing = await getWebhookQueue(workspaceId);
    existing.push(job);
    localStorage.setItem(key, JSON.stringify(existing));
  }
}

/**
 * Get webhook queue jobs
 */
async function getWebhookQueue(workspaceId: string): Promise<WebhookQueueJob[]> {
  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const queueRef = collection(db, WEBHOOK_QUEUE_COLLECTION);
      const q = query(
        queueRef,
        where('workspaceId', '==', workspaceId),
        orderBy('nextRunAt', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          nextRunAt: data.nextRunAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as WebhookQueueJob;
      });
    } else {
      // localStorage fallback
      const key = getWebhookQueueKey(workspaceId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const jobs = JSON.parse(stored);
        return jobs.map((j: any) => ({
          ...j,
          nextRunAt: new Date(j.nextRunAt),
          createdAt: new Date(j.createdAt),
          updatedAt: new Date(j.updatedAt),
        }));
      }
      return [];
    }
  } catch (error) {
    console.error('[Webhooks] Error getting queue:', error);
    return [];
  }
}

/**
 * Process a queued webhook job
 */
async function processQueueJob(job: WebhookQueueJob): Promise<void> {
  const webhooks = await getWebhooks(job.workspaceId);
  const webhook = webhooks.find(w => w.id === job.webhookId);
  
  if (!webhook || !webhook.enabled) {
    // Remove job if webhook doesn't exist or is disabled
    await removeQueueJob(job.workspaceId, job.id);
    return;
  }

  const result = await deliverWebhook(webhook, job.eventType, job.payload);
  
  // Log the attempt
  await logWebhookDelivery({
    webhookId: job.webhookId,
    workspaceId: job.workspaceId,
    eventType: job.eventType,
    status: result.success ? 'success' : (job.attempt >= MAX_ATTEMPTS ? 'failed' : 'retrying'),
    attempt: job.attempt,
    responseStatus: result.status,
    errorMessage: result.error,
    durationMs: result.durationMs,
    timestamp: new Date(),
    payload: job.payload,
  });

  if (result.success) {
    // Remove from queue on success
    await removeQueueJob(job.workspaceId, job.id);
  } else {
    // Queue next retry or remove if max attempts reached
    if (job.attempt < MAX_ATTEMPTS) {
      await removeQueueJob(job.workspaceId, job.id);
      await queueRetry(job.webhookId, job.workspaceId, job.eventType, job.payload, job.attempt + 1, result.error);
    } else {
      await removeQueueJob(job.workspaceId, job.id);
    }
  }
}

/**
 * Remove a queue job
 */
async function removeQueueJob(workspaceId: string, jobId: string): Promise<void> {
  try {
    const useFirestore = await isFirestoreAvailable();
    
    if (useFirestore) {
      const jobRef = doc(db, WEBHOOK_QUEUE_COLLECTION, jobId);
      await deleteDoc(jobRef);
    } else {
      // localStorage fallback
      const key = getWebhookQueueKey(workspaceId);
      const queue = await getWebhookQueue(workspaceId);
      const filtered = queue.filter(j => j.id !== jobId);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('[Webhooks] Error removing queue job:', error);
  }
}

/**
 * Start the webhook retry worker
 */
export function startWebhookRetryWorker(workspaceId: string): void {
  if (retryWorkerInterval) {
    return; // Already running
  }

  retryWorkerInterval = setInterval(async () => {
    try {
      const queue = await getWebhookQueue(workspaceId);
      const now = new Date();
      
      // Process jobs that are due
      const dueJobs = queue.filter(job => job.nextRunAt <= now);
      
      for (const job of dueJobs) {
        await processQueueJob(job);
      }
    } catch (error) {
      console.error('[Webhooks] Error in retry worker:', error);
    }
  }, RETRY_WORKER_INTERVAL);
  
  console.log('[Webhooks] Retry worker started');
}

/**
 * Stop the webhook retry worker
 */
export function stopWebhookRetryWorker(): void {
  if (retryWorkerInterval) {
    clearInterval(retryWorkerInterval);
    retryWorkerInterval = null;
    console.log('[Webhooks] Retry worker stopped');
  }
}

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooks(
  workspaceId: string,
  eventType: WebhookEventType,
  payload: WebhookPayload
): Promise<void> {
  console.log('[triggerWebhooks] Called', { workspaceId, eventType, payload });
  
  const webhooks = await getWebhooks(workspaceId);
  console.log('[triggerWebhooks] Loaded webhooks:', webhooks.length);
  
  // For test events, deliver to the specific webhook if webhookId is in payload
  let enabledWebhooks = webhooks.filter(w => w.enabled && w.events.includes(eventType));
  
  // Special handling for test events - deliver to the specific webhook
  if (eventType === 'webhook.test' && payload.data?.webhookId) {
    const testWebhook = webhooks.find(w => w.id === payload.data.webhookId);
    if (testWebhook && testWebhook.enabled) {
      enabledWebhooks = [testWebhook];
      console.log('[triggerWebhooks] Test webhook found:', testWebhook.id);
    }
  }

  console.log('[triggerWebhooks] Enabled webhooks matching event:', enabledWebhooks.length);

  if (enabledWebhooks.length === 0) {
    console.log('[triggerWebhooks] No matching webhooks, returning');
    return;
  }

  // Deliver to all matching webhooks in parallel
  const deliveries = enabledWebhooks.map(async (webhook) => {
    console.log('[triggerWebhooks] Starting delivery to webhook:', webhook.id, webhook.url);
    const result = await deliverWebhook(webhook, eventType, payload);
    console.log('[triggerWebhooks] Delivery result:', { webhookId: webhook.id, success: result.success, status: result.status, error: result.error });
    
    // Log the delivery - ALWAYS log, success or failure
    console.log('[triggerWebhooks] Creating log entry for webhook:', webhook.id);
    await logWebhookDelivery({
      webhookId: webhook.id,
      workspaceId,
      eventType,
      status: result.success ? 'success' : 'retrying',
      attempt: 1,
      responseStatus: result.status,
      errorMessage: result.error,
      durationMs: result.durationMs,
      timestamp: new Date(),
      payload,
    });
    console.log('[triggerWebhooks] Log entry created for webhook:', webhook.id);

    // Queue retry if failed
    if (!result.success) {
      console.log('[triggerWebhooks] Queueing retry for failed webhook:', webhook.id);
      await queueRetry(webhook.id, workspaceId, eventType, payload, 1, result.error);
    }
  });

  await Promise.allSettled(deliveries);
  console.log('[triggerWebhooks] All deliveries completed');
}

/**
 * Generate a random secret for webhook
 */
export function generateWebhookSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
