import { useEffect, useState } from 'react';

// This hook handles the dark mode theme switching.
// It checks local storage first, then falls back to the system preference.

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage to see if the user has a saved preference
    const saved = localStorage.getItem('darkMode');
    // If we find a saved string, convert it to a boolean
    if (saved !== null) {
      return saved === 'true';
    }
    // Otherwise, use the system's color scheme preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply the 'dark' class to the HTML root element whenever isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Save the new preference to localStorage so it persists
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return { isDark, toggleDarkMode };
};
