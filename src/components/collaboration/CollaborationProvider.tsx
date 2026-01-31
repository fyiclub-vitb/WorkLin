import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { subscribeToAuth } from '../../lib/firebase/auth';
import { createYjsProvider } from '../../lib/collaboration/yjs-provider';
import { updateUserAwareness, getRandomUserColor } from '../../lib/collaboration/cursor-sync';

interface CollaborationContextType {
  ydoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  userInfo: { name: string; color: string } | null;
  isReady: boolean;
}

// Create a context so child components can access the collaboration setup
const CollaborationContext = createContext<CollaborationContextType>({
  ydoc: null,
  provider: null,
  userInfo: null,
  isReady: false,
});

// Hook to easily access collaboration stuff from any component
export const useCollaboration = () => useContext(CollaborationContext);

interface CollaborationProviderProps {
  pageId: string;
  children: React.ReactNode;
}

// This provider sets up real-time collaboration for a page using Yjs
// Multiple people can edit the same page at once and see each other's changes
export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  pageId,
  children,
}) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null); // Yjs document for syncing
  const [provider, setProvider] = useState<WebsocketProvider | null>(null); // WebSocket connection
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Pick a random color for this user's cursor (stays the same for the session)
  const userColor = useRef(getRandomUserColor()).current;

  // Step 1: Listen for changes in authentication status
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Step 2: Set up the Yjs collaboration when pageId changes
  useEffect(() => {
    if (!pageId) return;

    // Create a new Yjs document and WebSocket provider
    const { doc, provider: wsProvider } = createYjsProvider(pageId);

    // Log connection status for debugging
    if (wsProvider) {
      wsProvider.on('status', (event: any) => {
        console.log('Collaboration Status:', event.status);
      });
    }

    setYdoc(doc);
    setProvider(wsProvider);
    setIsReady(true);

    // Clean up when component unmounts or pageId changes
    return () => {
      if (wsProvider) {
        wsProvider.destroy();
      }
      doc.destroy();
    };
  }, [pageId]);

  // Step 3: Sync user awareness (cursor position, name, color)
  // This lets other users see where you're editing
  useEffect(() => {
    if (!provider || !currentUser || !provider.awareness) return;

    // Get user's display name or email
    const name = currentUser.displayName || currentUser.email || 'Anonymous';

    // Update awareness with user info
    updateUserAwareness(provider.awareness, {
      name,
      color: userColor
    });

  }, [provider, currentUser, userColor]);

  // Package up user info to pass down to children
  const userInfo = {
    name: currentUser?.displayName || currentUser?.email || 'Anonymous',
    color: userColor
  };

  return (
    <CollaborationContext.Provider value={{ ydoc, provider, userInfo, isReady }}>
      {children}
    </CollaborationContext.Provider>
  );
};