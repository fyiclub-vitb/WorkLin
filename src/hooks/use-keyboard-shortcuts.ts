import { useEffect, useState } from 'react';

// This hook handles global keyboard shortcuts for the application.
// Currently it toggles the shortcuts modal when the user presses '?' (or Shift+/).

export function useKeyboardShortcuts() {
  // State to track if the shortcuts help modal is open or not
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows) + ? (which is Shift + /)
      // We check for '?' key directly or '/' with shift modifier
      // If the user presses the '?' key (often Shift+/ on English layouts) along with Cmd/Ctrl,
      // we prevent the default browser behavior and toggle our help modal.
      if ((e.metaKey || e.ctrlKey) && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}