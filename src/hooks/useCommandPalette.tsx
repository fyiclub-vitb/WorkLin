import { useEffect, useState, useCallback, ReactNode } from 'react';
// This hook manages the state and available commands for the Command Palette (Cmd+K).
// It defines the list of actions users can perform such as navigation, creating items, etc.
import { CommandItem } from '../components/CommandPalette';
import { Plus, Trash2, Copy, Settings, LogOut, Search, Eye, Table, Grid3x3, Calendar } from 'lucide-react';

// Local mapping of string identifiers to actual icon components
// This makes it easier to reference icons by name in the command objects.
const iconMap: Record<string, ReactNode> = {
  plus: <Plus size={16} />,
  search: <Search size={16} />,
  trash: <Trash2 size={16} />,
  copy: <Copy size={16} />,
  settings: <Settings size={16} />,
  logout: <LogOut size={16} />,
  eye: <Eye size={16} />,
  table: <Table size={16} />,
  grid: <Grid3x3 size={16} />,
  calendar: <Calendar size={16} />,
};

export const useCommandPalette = (onCreatePage?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<CommandItem[]>([]);

  // Initialize the list of available commands.
  // We use useEffect here because some commands might depend on props (like onCreatePage)
  // or other external state that updates over time.
  useEffect(() => {
    const initialCommands: CommandItem[] = [
      // Page commands
      {
        id: 'create-page',
        title: 'Create New Page',
        description: 'Add a new page to your workspace',
        category: 'page',
        icon: <Plus size={16} />,
        action: () => {
          onCreatePage?.();
          setIsOpen(false);
        },
        shortcut: 'Cmd+N',
      },
      {
        id: 'search-pages',
        title: 'Search Pages',
        description: 'Find pages in your workspace',
        category: 'page',
        icon: <Search size={16} />,
        action: () => {
          // Focus search bar
          const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            setIsOpen(false);
          }
        },
        shortcut: 'Cmd+K',
      },

      // Block commands
      {
        id: 'add-paragraph',
        title: 'Add Paragraph',
        description: 'Insert a text paragraph block',
        category: 'block',
        icon: <Plus size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+Alt+P',
      },
      {
        id: 'add-heading',
        title: 'Add Heading',
        description: 'Insert a heading block',
        category: 'block',
        icon: <Plus size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+Alt+H',
      },
      {
        id: 'add-code',
        title: 'Add Code Block',
        description: 'Insert a code block with syntax highlighting',
        category: 'block',
        icon: <Plus size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+Alt+C',
      },

      // View commands
      {
        id: 'table-view',
        title: 'Table View',
        description: 'Switch to table view',
        category: 'view',
        icon: <Table size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+1',
      },
      {
        id: 'board-view',
        title: 'Board View',
        description: 'Switch to board (Kanban) view',
        category: 'view',
        icon: <Grid3x3 size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+2',
      },
      {
        id: 'calendar-view',
        title: 'Calendar View',
        description: 'Switch to calendar view',
        category: 'view',
        icon: <Calendar size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+3',
      },

      // Workspace commands
      {
        id: 'dark-mode',
        title: 'Toggle Dark Mode',
        description: 'Switch between light and dark theme',
        category: 'workspace',
        icon: <Eye size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+Shift+D',
      },
      {
        id: 'export-page',
        title: 'Export Page',
        description: 'Export current page as PDF, Markdown, or HTML',
        category: 'workspace',
        icon: <Copy size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+E',
      },

      // Settings commands
      {
        id: 'settings',
        title: 'Settings',
        description: 'Open workspace settings',
        category: 'settings',
        icon: <Settings size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+,',
      },
      {
        id: 'logout',
        title: 'Log Out',
        description: 'Sign out of your account',
        category: 'settings',
        icon: <LogOut size={16} />,
        action: () => {
          setIsOpen(false);
        },
        shortcut: 'Cmd+Shift+Q',
      },
    ];

    setCommands(initialCommands);
  }, [onCreatePage]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    commands,
  };
};
