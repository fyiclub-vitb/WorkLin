import { Awareness } from 'y-protocols/awareness';

export const updateUserAwareness = (
  awareness: Awareness, 
  user: { name: string; color: string }
) => {
  awareness.setLocalStateField('user', user);
};

export const getRandomUserColor = () => {
  const colors = ['#f783ac', '#d946ef', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
  return colors[Math.floor(Math.random() * colors.length)];
};