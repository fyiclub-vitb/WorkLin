import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { subscribeToAuth } from '../../lib/firebase/auth'; 
// Import the new modular files
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
import React, { useEffect, useState } from 'react';

// @ts-ignore
import { WebrtcProvider } from 'y-websocket';
// TODO: Implement real-time collaboration using Yjs
// This is a placeholder for contributors to implement
// See issue #X for details

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

  const [provider, setProvider] = useState<WebrtcProvider | null>(null);


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

    // Use the helper function from yjs-provider.ts
    const { doc, provider: wsProvider } = createYjsProvider(pageId);

    wsProvider.on('status', (event: any) => {
      console.log('Collaboration Status:', event.status);
    });

    setYdoc(doc);
    setProvider(wsProvider);
    setIsReady(true);

    return () => {

      wsProvider.destroy();
      doc.destroy();

      // Cleanup
      if (provider) {
        provider.destroy();
      }


    };
  }, [pageId]);

  // 3. Sync User Awareness (Cursor)
  useEffect(() => {
    if (!provider || !currentUser) return;
    
    const name = currentUser.displayName || currentUser.email || 'Anonymous';
    
    // Use the helper function from cursor-sync.ts
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