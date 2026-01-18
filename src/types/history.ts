import { Timestamp } from 'firebase/firestore';

// Represents a change between two states
// Stores what the value was before and what it changed to
// This is used to show what exactly changed in each edit
export interface ChangeDiff {
    [key: string]: {
        before: any; // The old value before the change
        after: any; // The new value after the change
    };
}

// Represents a single entry in the page's edit history
// Each edit creates a new history entry that tracks who made the change and what changed
export interface HistoryEntry {
    id: string; // Unique identifier for this history entry
    pageId: string; // Which page this edit belongs to
    authorId: string; // User ID of who made the edit
    authorName: string; // Name of the author at the time of edit (snapshot for reliability)
    createdAt: Date | Timestamp; // When this edit was made
    diff: ChangeDiff; // Object containing the specific changes made
    snapshot?: any; // Full page data snapshot (only stored at certain intervals to save space)
    isSnapshot: boolean; // Flag to quickly identify if this entry contains a full snapshot
    restoreVersionId?: string; // If this version was created by restoring an old version, reference to that version
}