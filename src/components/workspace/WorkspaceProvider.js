import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { subscribeToAuth } from '../../lib/firebase/auth';
import { useWorkspaceStore } from '../../store/workspaceStore';
export const WorkspaceProvider = ({ children }) => {
    const { user, setUser, setCurrentWorkspace, setPages, setCurrentPageId, setBlocks } = useWorkspaceStore();
    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = subscribeToAuth((user) => {
            setUser(user);
            if (user) {
                // TODO: Load user's default workspace or create one
                // This is incomplete for contributors to implement
                // See issue #X for details
            }
            else {
                setCurrentWorkspace(null);
                setPages([]);
                setCurrentPageId(null);
                setBlocks([]);
            }
        });
        return () => unsubscribe();
    }, [setUser, setCurrentWorkspace, setPages, setCurrentPageId, setBlocks]);
    return _jsx(_Fragment, { children: children });
};
