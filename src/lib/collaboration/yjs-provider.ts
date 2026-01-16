import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const createYjsProvider = (pageId: string) => {
  const doc = new Y.Doc();
  
  // Use environment variable for WebSocket URL, or disable collaboration if not configured
  const wsUrl = import.meta.env.VITE_YJS_WEBSOCKET_URL;
  
  // If no WebSocket URL is configured, return a local-only doc (no collaboration)
  if (!wsUrl) {
    console.warn('Yjs WebSocket URL not configured. Collaboration disabled. Set VITE_YJS_WEBSOCKET_URL in .env to enable.');
    return { doc, provider: null };
  }
  
  try {
    const provider = new WebsocketProvider(
      wsUrl,
      `worklin-page-${pageId}`,
      doc
    );

    // Handle connection errors gracefully
    provider.on('status', (event: { status: string }) => {
      if (event.status === 'disconnected') {
        console.warn('Yjs WebSocket disconnected. Collaboration may not work.');
      }
    });

    provider.on('connection-error', (event: Event, provider: WebsocketProvider) => {
      console.error('Yjs WebSocket connection error:', event);
    });

    return { doc, provider };
  } catch (error) {
    console.error('Failed to create Yjs provider:', error);
    return { doc, provider: null };
  }
};