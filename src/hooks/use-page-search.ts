import { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../types/workspace';

// This hook manages the search functionality associated with the Command Palette or a dedicated search bar.
// It filters through the provided list of pages based on the user's input.

export const usePageSearch = (pages: Page[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter pages based on search query using useMemo
  // This ensures we only re-calculate the filtered list when the pages or search query changes,
  // preventing unnecessary processing on every render.
  const filteredPages = useMemo(() => {
    // If the search query is empty, just return all pages
    if (!searchQuery.trim()) return pages;

    // Otherwise, filter pages where the title includes the search term (case-insensitive)
    return pages.filter((page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  // Handle keyboard shortcut (Cmd+K / Ctrl+K) to focus the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If the user presses Cmd/Ctrl + K, we prevent the default browser behavior (usually focusing the address bar)
      // and instead focus our search input field if it exists.
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filteredPages,
    inputRef
  };
};