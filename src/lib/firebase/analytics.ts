// src/lib/firebase/analytics.ts
import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from './config';

// Small wrapper around Firebase Analytics.
//
// Benefits:
// - typed event names (easy to grep, fewer typos)
// - safe no-op when analytics isn't available
export type AnalyticsEvent =
  | 'page_view'
  | 'workspace_create'
  | 'page_create'
  | 'block_create'
  | 'comment_add'
  | 'share_workspace'
  | 'export_page'
  | 'login'
  | 'signup';

export const logAnalyticsEvent = (eventName: AnalyticsEvent, params?: Record<string, any>) => {
  if (analytics) {
    // Firebase's `logEvent` overloads can be picky about string literal unions.
    // Casting here keeps our call sites type-safe without fighting the overloads.
    firebaseLogEvent(analytics, eventName as string, params);
  }
};

// Convenience helper used by some routes; kept as a tiny wrapper so call sites stay consistent.
export const logPageView = (pageId: string, pageTitle: string, workspaceId: string) => {
  logAnalyticsEvent('page_view', {
    page_id: pageId,
    page_title: pageTitle,
    workspace_id: workspaceId
  });
};