import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export const createYjsProvider = (pageId: string) => {
  const doc = new Y.Doc();
  
  // We use the public demo server for this implementation.
  // In a production app, you would host your own y-websocket server.
  const provider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    `worklin-page-${pageId}`,
    doc
  );

  return { doc, provider };
};