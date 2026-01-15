import {
    collection,
    doc,
    getDocs,
    addDoc,
    query,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from './config';
import { HistoryEntry, ChangeDiff } from '../../types/history';
import { Page } from '../../types/workspace';
import _ from 'lodash'; // Assuming lodash is available or will use basic object comparison

const SNAPSHOT_INTERVAL = 10;

export const getPageHistory = async (pageId: string): Promise<HistoryEntry[]> => {
    const versionsRef = collection(db, 'pages', pageId, 'versions');
    const q = query(versionsRef, orderBy('createdAt', 'desc'), limit(50));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as HistoryEntry));
};

export const createVersion = async (
    pageId: string,
    oldPage: Page,
    newPage: Page,
    userId: string,
    userName: string = 'Unknown'
) => {
    // 1. Calculate Diff
    const diff: ChangeDiff = {};
    const allKeys = new Set([...Object.keys(oldPage), ...Object.keys(newPage)]);

    allKeys.forEach(key => {
        const k = key as keyof Page;
        if (JSON.stringify(oldPage[k]) !== JSON.stringify(newPage[k])) {
            diff[key] = {
                before: oldPage[k],
                after: newPage[k]
            };
        }
    });

    if (Object.keys(diff).length === 0) return; // No changes

    // 2. Check if we need a snapshot
    // Optimization: In a real app we might query the last version count to determine this
    // For now, we'll randomize or just not check interval purely to simplify valid logic
    // Better approach: Just save diffs for now, and rely on 'snapshot' being passed explicitly if needed
    // Or check previous version index. 

    // Simple strategy: Always save diff. 
    // For robustness, let's say every version IS a diff, but specific ones CAN be snapshots.

    const versionData: Omit<HistoryEntry, 'id'> = {
        pageId,
        authorId: userId,
        authorName: userName,
        createdAt: serverTimestamp() as Timestamp, // Use server timestamp
        diff,
        isSnapshot: false // Default to false for now to save space
    };

    const versionsRef = collection(db, 'pages', pageId, 'versions');
    await addDoc(versionsRef, versionData);
};

export const restoreVersion = async (pageId: string, versionId: string, userId: string): Promise<void> => {
    // 1. Get the target version
    const versionsRef = collection(db, 'pages', pageId, 'versions');
    const versionDoc = await getDoc(doc(versionsRef, versionId));

    if (!versionDoc.exists()) {
        throw new Error('Version not found');
    }

    const targetVersion = versionDoc.data() as HistoryEntry;

    // NOTE: If we only stored diffs, we would need to "replay" them from the nearest snapshot.
    // BUT, since the user requirement asked for efficient storage (diffs), 
    // we need a way to reconstruct.
    //
    // STRATEGY:
    // If 'snapshot' is missing, we must traverse BACKWARDS from the current live page 
    // REVERSING the diffs until we reach the target version? 
    // OR traverse FORWARDS from the last snapshot?
    // 
    // For simplicity in this iteration:
    // I will assume for now that to restore, we might need a robust 'reconstruct' function.
    // 
    // Let's implement a simpler 'reconstruct' approach:
    // Fetch ALL versions (or up to a snapshot) and replay.
    // 
    // HOWEVER, simplified approach for MVP:
    // If we don't implement full replay logic yet, 'restore' might be tricky if we don't have the full object.
    //
    // ALTERNATIVE: For now, let's assume 'previewVersion' logic does the heavy lifting.

    // For this step, I'll return the Reconstructed Page.
    const restoredPage = await reconstructPageAtVersion(pageId, versionId);

    // 2. Update the Live Page
    // We need to import the updatePage function from database.ts to avoid circular deps if possible
    // OR just do a raw firestore update here.
    const pageRef = doc(db, 'pages', pageId);

    // Create a new version representing this restore
    // We can let the standard 'updatePage' hook handle the version creation if we call it standardly.
    // But here we might want to flag it.

    await import('./database').then(async (mod) => {
        await mod.updatePage(pageId, restoredPage, userId);
    });
};

// Start from current live page and apply REVERSE diffs until we reach target version
// OR start from 0 if we have full history?
// Actually, 'Reversing' diffs from Present -> Past is usually easier if we have the current state.
export const reconstructPageAtVersion = async (pageId: string, versionId: string): Promise<Page> => {
    // 1. Get Current Live Page
    const pageRef = doc(db, 'pages', pageId);
    const pageSnap = await getDoc(pageRef);
    if (!pageSnap.exists()) throw new Error("Page does not exist");
    let currentPage = pageSnap.data() as Page;

    // 2. Get all versions AFTER the target version, in DESCENDING order (Newest -> Target)
    const versionsRef = collection(db, 'pages', pageId, 'versions');
    const q = query(versionsRef, orderBy('createdAt', 'desc'));
    // We get all, then filter in memory because Firestore queries are limited

    const querySnapshot = await getDocs(q);
    const allVersions = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry));

    // Find index of target
    const targetIndex = allVersions.findIndex(v => v.id === versionId);
    if (targetIndex === -1) throw new Error("Target version not found");

    // Versions to revert: From Index 0 (Newest) to TargetIndex - 1
    // Wait, if we want to get TO target version state, we need to revert changes FROM all versions created AFTER it.
    // So we revert versions: [0, 1, ... targetIndex-1]
    // We DO NOT revert the target version itself (because that version's state IS what we want).

    const versionsToRevert = allVersions.slice(0, targetIndex); // If target is 0 (latest), this is empty. Correct.

    for (const version of versionsToRevert) {
        currentPage = revertDiff(currentPage, version.diff);
    }

    // Also, we must revert the diff of the versions that occurred *after* the target. 
    // The 'diff' in a version entry represents "Changes made to create THIS version".
    // So Version 5 diff = "Changes from V4 to V5".
    // If we are at V5 (Live) and want to go to V3:
    // We need to Undo V5's changes -> gets us to V4.
    // We need to Undo V4's changes -> gets us to V3.
    // Correct.

    return currentPage;
};

const revertDiff = (page: Page, diff: ChangeDiff): Page => {
    const reverted = _.cloneDeep(page);

    Object.keys(diff).forEach(key => {
        // Diff: { property: { before: "OldVal", after: "NewVal" } }
        // We want to go BACK to "before"
        const k = key as keyof Page;
        reverted[k] = diff[key].before;
    });

    return reverted;
};
