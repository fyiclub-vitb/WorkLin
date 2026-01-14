import { useState, useMemo, useRef, useEffect } from 'react';
import { Page } from '../types/workspace';

export const usePageSearch = (pages: Page[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    return pages.filter((page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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