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

// The collection name where we store analytics data in Firestore
const ANALYTICS_COLLECTION = 'analytics';

// Helper function to get today's date in YYYY-MM-DD format
// This is used as the document ID for daily analytics
const getTodayStr = () => new Date().toISOString().split('T')[0];

// Define the types of activities we can track
// Each activity type gets counted separately in the analytics
export type ActivityType = 'page_view' | 'page_create' | 'block_create';

// Main function to track user activities in the workspace
// This increments counters for different activity types
// The data is stored in a subcollection under each workspace
export const trackActivity = async (
  workspaceId: string, 
  activity: ActivityType
) => {
  // Don't track if workspace ID is missing
  if (!workspaceId) return;

  const today = getTodayStr();
  // Create a reference to the analytics document for today
  // Structure: workspaces/{workspaceId}/analytics/{YYYY-MM-DD}
  const statsRef = doc(db, 'workspaces', workspaceId, ANALYTICS_COLLECTION, today);

  try {
    // Initialize the updates object with a timestamp
    const updates: any = {
      updatedAt: serverTimestamp()
    };

    // Add increment operations based on the activity type
    // These will create the field if it doesn't exist or increment if it does
    if (activity === 'page_view') updates.pageViews = increment(1);
    if (activity === 'page_create') updates.pagesCreated = increment(1);
    if (activity === 'block_create') updates.blocksCreated = increment(1);

    // Use merge: true to create the document if it doesn't exist
    // or update it if it already exists without overwriting other fields
    await setDoc(statsRef, updates, { merge: true });

  } catch (error) {
    // Log errors but don't throw them to avoid breaking the main app flow
    console.error('Error tracking activity:', error);
  }
};

// Function to retrieve workspace statistics for a given number of days
// Returns an array of daily stats in chronological order
export const getWorkspaceStats = async (workspaceId: string, days = 14) => {
  try {
    // Get reference to the analytics subcollection
    const statsRef = collection(db, 'workspaces', workspaceId, ANALYTICS_COLLECTION);
    
    // Build a query to get the most recent N days
    // We order by document ID (which is the date) in descending order
    const q = query(
      statsRef,
      orderBy('__name__', 'desc'), // Order by ID (which is the date string)
      limit(days)
    );

    // Execute the query and get the documents
    const snapshot = await getDocs(q);
    
    // Transform the documents into a more usable format
    // We reverse the array to get chronological order (oldest to newest)
    const data = snapshot.docs.map(doc => ({
      date: doc.id, // The document ID is the date
      ...doc.data() // Spread the rest of the data (pageViews, pagesCreated, etc.)
    })).reverse();

    return data;
  } catch (error) {
    // Return empty array on error instead of throwing
    // This prevents the UI from breaking if analytics fail
    console.error('Error fetching stats:', error);
    return [];
  }
};