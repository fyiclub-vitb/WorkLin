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

const CollaborationContext = createContext<CollaborationContextType>({
  ydoc: null,
  provider: null,
  userInfo: null,
  isReady: false,
});

export const useCollaboration = () => useContext(CollaborationContext);

interface CollaborationProviderProps {
  pageId: string;
  children: React.ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  pageId,
  children,
}) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get a persistent color for this session
  const userColor = useRef(getRandomUserColor()).current;

  // 1. Listen for Authentication
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Initialize Yjs Provider
  useEffect(() => {
    if (!pageId) return;

    const { doc, provider: wsProvider } = createYjsProvider(pageId);

    // Only set up event listeners if provider exists
    if (wsProvider) {
      wsProvider.on('status', (event: any) => {
        console.log('Collaboration Status:', event.status);
      });
    }

    setYdoc(doc);
    setProvider(wsProvider);
    setIsReady(true);

    return () => {
      if (wsProvider) {
        wsProvider.destroy();
      }
      doc.destroy();
    };
  }, [pageId]);

  // 3. Sync User Awareness (Cursor)
  useEffect(() => {
    if (!provider || !currentUser || !provider.awareness) return;

    const name = currentUser.displayName || currentUser.email || 'Anonymous';

    updateUserAwareness(provider.awareness, {
      name,
      color: userColor
    });

  }, [provider, currentUser, userColor]);

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