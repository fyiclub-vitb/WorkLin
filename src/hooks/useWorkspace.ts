import { useState, useEffect } from 'react';
import { Workspace, Page, Block, BlockType } from '../types/workspace';
import { createVersion } from '../lib/firebase/history';

const STORAGE_KEY = 'worklin-workspace';

export const useWorkspace = () => {
  // FIX 1: Initialize with a complete Workspace object, not just { pages: [] }
  const [workspace, setWorkspace] = useState<Workspace>({
    id: 'default',
    name: 'My Workspace',
    ownerId: 'local-user',
    members: [],
    pages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // FIX 2: Reconstruct the full object and handle date conversions for the root object too
        // We use spread (...parsed) to keep id, name, etc., then overwrite dates and pages
        const workspaceWithDates: Workspace = {
          ...parsed,
          createdAt: new Date(parsed.createdAt || Date.now()),
          updatedAt: new Date(parsed.updatedAt || Date.now()),
          // Ensure these exist if loading from an older version of data
          id: parsed.id || 'default',
          name: parsed.name || 'My Workspace',
          ownerId: parsed.ownerId || 'local-user',
          members: parsed.members || [],
          pages: parsed.pages.map((page: any) => ({
            ...page,
            createdAt: new Date(page.createdAt),
            updatedAt: new Date(page.updatedAt),
          })),
        };
        setWorkspace(workspaceWithDates);
        if (workspaceWithDates.pages.length > 0) {
          // Only set if not already set (or purely reset)
          setCurrentPageId(workspaceWithDates.pages[0].id);
        }
      } catch (error) {
        console.error('Failed to parse workspace:', error);
        initializeDefault();
      }
    } else {
      initializeDefault();
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (workspace.pages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    }
  }, [workspace]);

  const initializeDefault = () => {
    const defaultPage: Page = {
      id: '1',
      title: 'Welcome to WorkLin',
      icon: '👋',
      blocks: [
        { id: 'b1', type: 'heading1', text: 'Welcome to WorkLin', content: 'Welcome to WorkLin', createdAt: new Date(), updatedAt: new Date() },
        { id: 'b2', type: 'paragraph', text: '✍️ Start typing to create your first note...', content: '✍️ Start typing to create your first note...', createdAt: new Date(), updatedAt: new Date() },
        { id: 'b3', type: 'paragraph', text: '📄 Click "New Page" in the sidebar to add more pages', content: '📄 Click "New Page" in the sidebar to add more pages', createdAt: new Date(), updatedAt: new Date() },
        { id: 'b4', type: 'bulleted-list', text: 'Supports headings, paragraphs, lists, and checklists', content: 'Supports headings, paragraphs, lists, and checklists', createdAt: new Date(), updatedAt: new Date() },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // FIX 3: Set a full Workspace object
    const defaultWorkspace: Workspace = {
      id: 'ws-default',
      name: 'My Workspace',
      ownerId: 'local-user',
      members: [],
      pages: [defaultPage],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Auto-seed block removed as per user request
    if (localStorage.getItem('worklin_local_seeded')) {
      localStorage.removeItem('worklin_local_seeded');
    }

    setWorkspace(defaultWorkspace);
    setCurrentPageId('1');
  };

  const addPage = (title: string = 'Untitled Page', icon: string = '📝') => {
    const newPage: Page = {
      id: Date.now().toString(),
      title,
      icon,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // FIX 4: Spread ...prev to keep existing workspace properties (id, name, etc.)
    setWorkspace((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      updatedAt: new Date()
    }));
    setCurrentPageId(newPage.id);
  };

  const deletePage = (pageId: string) => {
    // Mark as archived instead of deleting
    setWorkspace((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, isArchived: true, updatedAt: new Date() } : p
      ),
      updatedAt: new Date()
    }));
    // If current page is deleted, clear selection to show home/empty state
    if (currentPageId === pageId) {
      const remaining = workspace.pages.filter((p) => p.id !== pageId && !p.isArchived);
      setCurrentPageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const restorePage = (pageId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, isArchived: false, updatedAt: new Date() } : p
      ),
      updatedAt: new Date()
    }));
  };

  const permanentlyDeletePage = (pageId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      pages: prev.pages.filter((p) => p.id !== pageId),
      updatedAt: new Date()
    }));
    if (currentPageId === pageId) {
      const remaining = workspace.pages.filter((p) => p.id !== pageId);
      setCurrentPageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updatePageTitle = (pageId: string, title: string) => {
    const oldPage = workspace.pages.find(p => p.id === pageId);
    if (!oldPage) return;

    setWorkspace((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, title, updatedAt: new Date() } : p
      ),
      updatedAt: new Date()
    }));

    // Create version history entry
    const newPage = { ...oldPage, title, updatedAt: new Date() };
    createVersion(pageId, oldPage, newPage, 'local-user', 'Local User').catch(err => {
      console.error('Failed to create version:', err);
    });
  };

  const updatePageIcon = (pageId: string, icon: string) => {
    setWorkspace((prev) => ({
      ...prev, // Spread prev
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, icon, updatedAt: new Date() } : p
      ),
      updatedAt: new Date()
    }));
  };

  const updatePageCover = (pageId: string, cover: string | null) => {
    const oldPage = workspace.pages.find(p => p.id === pageId);
    if (!oldPage) return;

    setWorkspace((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, cover: cover || undefined, updatedAt: new Date() } : p
      ),
      updatedAt: new Date()
    }));

    // Create version history entry
    const newPage = { ...oldPage, cover: cover || undefined, updatedAt: new Date() };
    createVersion(pageId, oldPage, newPage, 'local-user', 'Local User').catch(err => {
      console.error('Failed to create version:', err);
    });
  };

  const addBlock = (pageId: string, type: BlockType = 'paragraph') => {
    setWorkspace((prev) => ({
      ...prev, // Spread prev
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
            ...p,
            blocks: [
              ...p.blocks,
              {
                id: Date.now().toString(),
                type,
                text: '',
                content: '',
                checked: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'local-user',
              },
            ],
            updatedAt: new Date(),
          }
          : p
      ),
      updatedAt: new Date()
    }));
  };

  const updateBlock = (pageId: string, blockId: string, updates: Partial<Block>) => {
    setWorkspace((prev) => ({
      ...prev, // Spread prev
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
            ...p,
            blocks: p.blocks.map((b) =>
              b.id === blockId ? { ...b, ...updates } : b
            ),
            updatedAt: new Date(),
          }
          : p
      ),
      updatedAt: new Date()
    }));
  };

  const deleteBlock = (pageId: string, blockId: string) => {
    setWorkspace((prev) => ({
      ...prev, // Spread prev
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
            ...p,
            blocks: p.blocks.filter((b) => b.id !== blockId),
            updatedAt: new Date(),
          }
          : p
      ),
      updatedAt: new Date()
    }));
  };

  const currentPage = workspace.pages.find((p) => p.id === currentPageId);
  const updatePageProperties = (pageId: string, properties: any) => {
  setWorkspace((prev) => ({
    ...prev,
    pages: prev.pages.map((p) =>
      p.id === pageId 
        ? { ...p, properties, updatedAt: new Date() } 
        : p
    ),
    updatedAt: new Date()
  }));
};


  // Filter out archived pages for main view
  const activePages = workspace.pages.filter((p) => !p.isArchived);
  const archivedPages = workspace.pages.filter((p) => p.isArchived);

  return {
    workspace: { ...workspace, pages: activePages },
    archivedPages,
    currentPage,
    currentPageId,
    setCurrentPageId,
    updatePageProperties,
    restorePage,
    permanentlyDeletePage,
    addPage,
    deletePage,
    updatePageTitle,
    updatePageIcon,
    updatePageCover,
    addBlock,
    updateBlock,
    deleteBlock,
  };
};