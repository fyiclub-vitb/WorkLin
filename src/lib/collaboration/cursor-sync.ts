import { Awareness } from 'y-protocols/awareness';

// Function to update the current user's presence in the collaborative session
// This lets other users see who is currently editing the document
// The awareness object is part of Yjs and syncs user state across clients
export const updateUserAwareness = (
  awareness: Awareness, 
  user: { name: string; color: string }
) => {
  // Set the local user's information in the awareness state
  // This will be broadcast to all connected users automatically
  awareness.setLocalStateField('user', user);
};

// Helper function to assign a random color to each user
// This is used for showing different users' cursors in different colors
// Makes it easy to see who is editing what in real-time collaboration
export const getRandomUserColor = () => {
  // Array of predefined colors that look good for cursor highlighting
  const colors = ['#f783ac', '#d946ef', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
  
  // Pick a random color from the array
  return colors[Math.floor(Math.random() * colors.length)];
};