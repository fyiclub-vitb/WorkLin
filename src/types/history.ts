import { Timestamp } from 'firebase/firestore';

export interface ChangeDiff {
    [key: string]: {
        before: any;
        after: any;
    };
}

export interface HistoryEntry {
    id: string;
    pageId: string;
    authorId: string;
    authorName: string; // Snapshot of author name at time of edit
    createdAt: Date | Timestamp;
    diff: ChangeDiff;
    snapshot?: any; // Full page data if specific snapshot interval is met
    isSnapshot: boolean; // Helper to know if this entry contains a full snapshot
    restoreVersionId?: string; // If this version was created via a restore
}
