// src/lib/collaboration/yjs-provider.ts
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

/**
 * Yjs Collaboration Provider Setup
 * * This module manages the real-time collaboration infrastructure using Yjs and WebSockets.
 * * Architecture:
 * - Yjs (CRDT): Handles conflict-free data synchronization between users.
 * - WebSocket: Transport layer to sync updates between clients and the server.
 * - Room-based: Each page acts as a unique "room" (identified by pageId).
 * * Usage:
 * Used by the CollaborationProvider component to establish a sync context for a specific page.
 */

/**
 * Creates and configures a Yjs WebSocket provider for a specific page.
 * * This function:
 * 1. Initializes a shared Yjs document (the "truth" for the page state).
 * 2. Connects to the centralized WebSocket server (if configured).
 * 3. Sets up connection status listeners for UI feedback (offline/online indicators).
 * * @param pageId - Unique identifier for the page (defines the collaboration room)
 * @returns Object containing the Yjs doc and the WebSocket provider (or null if disabled)
 */
export const createYjsProvider = (pageId: string) => {
  // 1. Create the Yjs document instance
  // This holds the shared data state locally and merges updates from peers
  const doc = new Y.Doc();
  
  // Use environment variable for WebSocket URL, or disable collaboration if not configured
  // This allows the app to work in "single-player" mode if no backend is set up
  const wsUrl = import.meta.env.VITE_YJS_WEBSOCKET_URL;
  
  // If no WebSocket URL is configured, return a local-only doc (no collaboration)
  if (!wsUrl) {
    console.warn('Yjs WebSocket URL not configured. Collaboration disabled. Set VITE_YJS_WEBSOCKET_URL in .env to enable.');
    return { doc, provider: null };
  }
  
  try {
    // 2. Initialize WebSocket Provider
    // Connects to the specific room `worklin-page-${pageId}`
    const provider = new WebsocketProvider(
      wsUrl,
      `worklin-page-${pageId}`,
      doc
    );

    // 3. Setup Connection Event Handlers
    // Handle connection errors gracefully to prevent app crashes
    provider.on('status', (event: { status: string }) => {
      if (event.status === 'disconnected') {
        // This can trigger UI indicators (handled by CollaborationContext)
        console.warn('Yjs WebSocket disconnected. Collaboration may not work.');
      }
    });

    provider.on('connection-error', (event: Event, provider: WebsocketProvider) => {
      console.error('Yjs WebSocket connection error:', event);
    });

    return { doc, provider };
  } catch (error) {
    console.error('Failed to create Yjs provider:', error);
    // Return a working doc even if provider fails, so the editor doesn't crash
    return { doc, provider: null };
  }
};