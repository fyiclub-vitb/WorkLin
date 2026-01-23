// Small localStorage helpers.
//
// These are used for lightweight persistence (e.g. last opened workspace/page).
// They intentionally swallow errors because storage can fail in private mode,
// embedded browsers, or when quota is exceeded.

export const STORAGE_KEY = 'worklin-workspace';

export const saveToStorage = (data: unknown): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Reads from localStorage and falls back to `defaultValue` if parsing/storage fails.
export const loadFromStorage = <T>(defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return defaultValue;
};
