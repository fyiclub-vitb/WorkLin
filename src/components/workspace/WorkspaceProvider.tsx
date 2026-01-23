import React, { useEffect } from 'react';
import { subscribeToAuth, getCurrentUser } from '../../lib/firebase/auth';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { subscribeToWorkspace, getWorkspace } from '../../lib/firebase/database';
import { getPagesByWorkspace, subscribeToPage } from '../../lib/firebase/database';
import { subscribeToBlocks } from '../../lib/firebase/database';

/**
 * Props for the WorkspaceProvider component
 */
interface WorkspaceProviderProps {
  children: React.ReactNode; // The app components that will be wrapped by this provider
}

/**
 * WorkspaceProvider Component
 * 
 * This is a context provider that manages the global workspace state.
 * It sits at the top of the app and handles:
 * 1. Listening for authentication changes (user login/logout)
 * 2. Loading the user's workspace data when they log in
 * 3. Cleaning up data when they log out
 * 
 * Think of it as the "conductor" that orchestrates all the data flow in the app.
 * Without this, components wouldn't know when users log in or what workspace they're using.
 * 
 * Note: This is partially implemented - contributors need to add workspace loading logic.
 */
export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  // Get functions from the workspace store to update global state
  const { user, setUser, setCurrentWorkspace, setPages, setCurrentPageId, setBlocks } = useWorkspaceStore();

  useEffect(() => {
    // Set up a listener for authentication state changes
    // This function will be called whenever a user logs in or out
    const unsubscribe = subscribeToAuth((user) => {
      // Update the user in our global store
      setUser(user);
      
      if (user) {
        // User just logged in
        // TODO: This is incomplete and needs to be implemented by contributors
        // What should happen here:
        // 1. Check if user has a default workspace
        // 2. If yes, load that workspace
        // 3. If no, create a new workspace for them
        // 4. Load all pages from that workspace
        // 5. Set up real-time listeners for workspace changes
        //
        // See issue #X for details on implementing this
      } else {
        // User just logged out
        // Clear all workspace data from memory
        setCurrentWorkspace(null); // No active workspace
        setPages([]); // Clear all pages
        setCurrentPageId(null); // No page selected
        setBlocks([]); // Clear all blocks
      }
    });

    // Cleanup function - runs when component unmounts
    // This stops listening to auth changes to prevent memory leaks
    return () => unsubscribe();
  }, [setUser, setCurrentWorkspace, setPages, setCurrentPageId, setBlocks]);

  // Just render the children components
  // The provider works invisibly in the background
  return <>{children}</>;
};