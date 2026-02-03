/**
 * Webhook Types
 * 
 * Types for webhook configuration, events, delivery logs, and queue jobs.
 * All webhook operations work client-side - no Firebase billing required.
 */

export type WebhookEventType =
  | 'page.created'
  | 'page.updated'
  | 'page.deleted'
  | 'block.created'
  | 'block.updated'
  | 'block.deleted'
  | 'webhook.test';

export interface WebhookConfig {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  events: WebhookEventType[];
  secret: string; // HMAC secret for signature
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  workspaceId: string;
  eventType: WebhookEventType;
  status: 'success' | 'failed' | 'retrying';
  attempt: number;
  responseStatus?: number;
  errorMessage?: string;
  durationMs: number;
  timestamp: Date;
  payload?: any; // Store payload for debugging
}

export interface WebhookQueueJob {
  id: string;
  webhookId: string;
  workspaceId: string;
  eventType: WebhookEventType;
  payload: any;
  attempt: number;
  nextRunAt: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookPayload {
  event: WebhookEventType;
  workspaceId: string;
  pageId?: string;
  blockId?: string;
  timestamp: number;
  data: any;
}
