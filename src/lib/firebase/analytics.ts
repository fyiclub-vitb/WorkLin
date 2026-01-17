// src/lib/firebase/analytics.ts
import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analytics } from './config';

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
    // 👇 FIX: Cast eventName to 'string' to resolve the overload error
    firebaseLogEvent(analytics, eventName as string, params);
  }
};

export const logPageView = (pageId: string, pageTitle: string, workspaceId: string) => {
  logAnalyticsEvent('page_view', {
    page_id: pageId,
    page_title: pageTitle,
    workspace_id: workspaceId
  });
};