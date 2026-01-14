// Utility functions for localStorage operations
// Currently handled directly in useWorkspace hook, but kept for future extensibility
export const STORAGE_KEY = 'worklin-workspace';
export const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
};
export const loadFromStorage = (defaultValue) => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    }
    catch (error) {
        console.error('Failed to load from localStorage:', error);
    }
    return defaultValue;
};
