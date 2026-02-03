// src/lib/firebase/presence.ts
//
// Presence via Yjs Awareness

//
// How it works:
//   - Each client already calls `awareness.setLocalStateField('user', …)`
//     inside CollaborationProvider (via cursor-sync.ts).  That broadcasts
//     {name, color} to every other tab in the same room automatically.
//   - This module adds a thin layer on top: it reads the full awareness map
//     and exposes a subscription that PresenceIndicator can consume.
//   - Disconnection is handled for free: when a WebSocket client drops,
//     y-websocket removes its awareness state from the shared map.  No
//     onDisconnect hook or server-side TTL needed.
//
// Dependencies: only `y-protocols/awareness` (already a transitive dep of yjs).

import { Awareness } from 'y-protocols/awareness';


// Types


export interface PresenceEntry {
    /** Yjs client id — unique per tab/connection, stable for the session */
    clientId: number;
    displayName: string;
    /** Hex colour string, e.g. '#3b82f6' */
    color: string;
    /** Optional photo URL from Firebase Auth profile */
    photoURL: string | null;
}


// Internal helpers


/**
 * Snapshot the current awareness state into a plain array.
 * Filters out the local client so the caller (PresenceIndicator) doesn't
 * have to do it — keeps the component dumb.
 */
const readOthers = (awareness: Awareness): PresenceEntry[] => {
    const localId = awareness.clientID;
    const entries: PresenceEntry[] = [];

    awareness.getStates().forEach((state, clientId) => {
        // Skip ourselves
        if (clientId === localId) return;

        // The 'user' field is written by cursor-sync's updateUserAwareness.
        // Shape: { name: string; color: string; photoURL?: string }
        const user = state.user as { name?: string; color?: string; photoURL?: string } | undefined;
        if (!user?.name) return; // skip clients that haven't set user info yet

        entries.push({
            clientId,
            displayName: user.name,
            color: user.color || '#6366f1', // fallback indigo if somehow missing
            photoURL: user.photoURL ?? null,
        });
    });

    return entries;
};


// Public API


/**
 * Subscribe to presence changes on the given Awareness instance.
 *
 * - Fires immediately with the current set of other users.
 * - Fires again on every join / leave / update.
 * - Returns an unsubscribe function.
 *
 * Usage (inside a component that has access to the Yjs provider):
 *
 *   const unsub = subscribeToPresence(provider.awareness, setUsers);
 *   // later …
 *   unsub();
 */
export const subscribeToPresence = (
    awareness: Awareness,
    callback: (users: PresenceEntry[]) => void
): () => void => {
    // Fire immediately so the UI doesn't flicker on mount
    callback(readOthers(awareness));

    // 'change' fires whenever any client's state changes —
    // joins, leaves, cursor moves, anything.
    const handler = () => callback(readOthers(awareness));
    awareness.on('change', handler);

    return () => awareness.off('change', handler);
};

/**
 * Enrich the local user's awareness state with their Firebase Auth photoURL.
 * Call this after auth resolves so avatars can render photos instead of initials.
 *
 * This is additive — it doesn't overwrite `name` or `color` that
 * CollaborationProvider already set via cursor-sync.
 */
export const setPresencePhoto = (
    awareness: Awareness,
    photoURL: string | null
): void => {
    const current = (awareness.getLocalState()?.user as Record<string, any>) || {};
    awareness.setLocalStateField('user', {
        ...current,
        photoURL,
    });
};