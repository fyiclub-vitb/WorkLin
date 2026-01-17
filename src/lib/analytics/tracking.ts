import { 
  doc, 
  setDoc, 
  increment, 
  serverTimestamp, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const ANALYTICS_COLLECTION = 'analytics';

// Helper to get today's date string YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

export type ActivityType = 'page_view' | 'page_create' | 'block_create';

/**
 * Tracks an activity in the workspace's analytics subcollection
 */
export const trackActivity = async (
  workspaceId: string, 
  activity: ActivityType
) => {
  if (!workspaceId) return;

  const today = getTodayStr();
  // Reference: workspaces/{id}/analytics/{date}
  const statsRef = doc(db, 'workspaces', workspaceId, ANALYTICS_COLLECTION, today);

  try {
    const updates: any = {
      updatedAt: serverTimestamp()
    };

    if (activity === 'page_view') updates.pageViews = increment(1);
    if (activity === 'page_create') updates.pagesCreated = increment(1);
    if (activity === 'block_create') updates.blocksCreated = increment(1);

    // merge: true ensures we create the doc if it doesn't exist, or update if it does
    await setDoc(statsRef, updates, { merge: true });

  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

export const getWorkspaceStats = async (workspaceId: string, days = 14) => {
  try {
    const statsRef = collection(db, 'workspaces', workspaceId, ANALYTICS_COLLECTION);
    const q = query(
      statsRef,
      orderBy('__name__', 'desc'), // Order by ID (which is the date string)
      limit(days)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      date: doc.id,
      ...doc.data()
    })).reverse();

    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return [];
  }
};