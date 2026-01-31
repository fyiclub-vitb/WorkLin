import { useState, useEffect } from 'react';
// This is the main hook for managing the workspace state (pages, blocks, etc.).
// It handles loading/saving to localStorage and provides functions for all CRUD operations.
import { Workspace, Page, Block, BlockType } from '../types/workspace';
import { Template } from '../types/template';
import { createVersion } from '../lib/firebase/history';
import { triggerWebhooks } from '../lib/integrations/webhooks';
// Note: Search indexing is now client-side only (MiniSearch) - no Firestore writes needed

const STORAGE_KEY = 'worklin-workspace';

export const useWorkspace = () => {
  // Initialize the workspace state.
  // We start with a default structure including an ID, name, and empty arrays for members and pages.
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

  // Load data from localStorage when the component mounts.
  // We need to carefully parse the JSON and convert date strings back into Date objects.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // FIX 2: Reconstruct the full object and handle date conversions for the root object too.
        // We use spread (...parsed) to keep id, name, etc., then overwrite dates with new Date().
        // We also loop through pages to fix their date fields.
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

        // If we have pages, set the first one as active
        if (workspaceWithDates.pages.length > 0) {
          // Only set if not already set (or purely reset)
          setCurrentPageId(workspaceWithDates.pages[0].id);
        }
      } catch (error) {
        console.error('Failed to parse workspace:', error);
        initializeDefault();
      }
    } else {
      // If no data exists, load the default template
      initializeDefault();
    }
  }, []);

  // Auto-save the workspace state to localStorage whenever it changes.
  // This ensures user data persists across refreshes.
  // Note: Search indexing is now client-side only (MiniSearch) - no Firestore writes needed here.
  useEffect(() => {
    if (workspace.pages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    }
  }, [workspace]);

  // Sets up the default workspace state if nothing is found in storage.
  // Creates a welcome page with some introductory blocks.
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

    // Auto-seed block removed as per user request (legacy cleanup)
    if (localStorage.getItem('worklin_local_seeded')) {
      localStorage.removeItem('worklin_local_seeded');
    }

    setWorkspace(defaultWorkspace);
    setCurrentPageId('1');
  };

  const addPage = (title: string = 'Untitled Page', icon: string = '📝', templateBlocks: any[] = []) => {
    const newPage: Page = {
      id: Date.now().toString(),
      title,
      icon,
      blocks: templateBlocks.map((b, i) => ({
        id: (Date.now() + i).toString(),
        type: b.type || 'paragraph',
        text: b.content || b.text || '',
        content: b.content || b.text || '',
        checked: b.checked || false,
        properties: b.properties || {},
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'local-user',
      } as Block)),
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceId: workspace.id,
    };

    setWorkspace((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      updatedAt: new Date()
    }));
    setCurrentPageId(newPage.id);

    // Trigger webhook for page creation
    if (workspace.id) {
      triggerWebhooks(workspace.id, 'page.created', {
        event: 'page.created',
        workspaceId: workspace.id,
        pageId: newPage.id,
        timestamp: Date.now(),
        data: newPage,
      }).catch(err => console.error('[useWorkspace] Error triggering webhook:', err));
    }
  };

  const addPageFromTemplate = (template: Template) => {
    if (template.content) {
      addPage(template.content.title, template.icon, template.content.blocks);
    }
  };

  const deletePage = (pageId: string) => {
    const page = workspace.pages.find(p => p.id === pageId);

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

    // Trigger webhook for page deletion
    if (workspace.id && page) {
      console.log('[useWorkspace] Triggering webhook for page.deleted', { pageId: pageId, workspaceId: workspace.id });
      triggerWebhooks(workspace.id, 'page.deleted', {
        event: 'page.deleted',
        workspaceId: workspace.id,
        pageId: pageId,
        timestamp: Date.now(),
        data: page,
      }).catch(err => console.error('[useWorkspace] Error triggering webhook:', err));
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

    // Trigger webhook for page update
    if (workspace.id) {
      console.log('[useWorkspace] Triggering webhook for page.updated', { pageId: pageId, workspaceId: workspace.id });
      triggerWebhooks(workspace.id, 'page.updated', {
        event: 'page.updated',
        workspaceId: workspace.id,
        pageId: pageId,
        timestamp: Date.now(),
        data: newPage,
      }).catch(err => console.error('[useWorkspace] Error triggering webhook:', err));
    }
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

    // Use null instead of undefined for Firestore compatibility
    const coverValue = cover || null;

    setWorkspace((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, cover: coverValue as any, updatedAt: new Date() } : p
      ),
      updatedAt: new Date()
    }));

    // Create version history entry
    const newPage = { ...oldPage, cover: coverValue as any, updatedAt: new Date() };
    createVersion(pageId, oldPage, newPage, 'local-user', 'Local User').catch(err => {
      console.error('Failed to create version:', err);
    });
  };

  const addBlock = (pageId: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      text: '',
      content: '',
      checked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'local-user',
    };

    setWorkspace((prev) => ({
      ...prev, // Spread prev
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
            ...p,
            blocks: [...p.blocks, newBlock],
            updatedAt: new Date(),
          }
          : p
      ),
      updatedAt: new Date()
    }));

    // Trigger webhook for block creation
    if (workspace.id) {
      console.log('[useWorkspace] Triggering webhook for block.created', { pageId: pageId, blockId: newBlock.id, workspaceId: workspace.id });
      triggerWebhooks(workspace.id, 'block.created', {
        event: 'block.created',
        workspaceId: workspace.id,
        pageId: pageId,
        blockId: newBlock.id,
        timestamp: Date.now(),
        data: newBlock,
      }).catch(err => console.error('[useWorkspace] Error triggering webhook:', err));
    }
  };

  const updateBlock = (pageId: string, blockId: string, updates: Partial<Block>) => {
    const page = workspace.pages.find(p => p.id === pageId);
    const block = page?.blocks.find(b => b.id === blockId);

    setWorkspace((prev) => ({
      ...prev, // Spread prev
      pages: prev.pages.map((p) =>
        p.id === pageId
          ? {
            ...p,
            blocks: p.blocks.map((b) =>
              b.id === blockId ? { ...b, ...updates, updatedAt: new Date() } : b
            ),
            updatedAt: new Date(),
          }
          : p
      ),
      updatedAt: new Date()
    }));

    // Trigger webhook for block update
    if (workspace.id && block) {
      const updatedBlock = { ...block, ...updates };
      console.log('[useWorkspace] Triggering webhook for block.updated', { pageId: pageId, blockId: blockId, workspaceId: workspace.id });
      triggerWebhooks(workspace.id, 'block.updated', {
        event: 'block.updated',
        workspaceId: workspace.id,
        pageId: pageId,
        blockId: blockId,
        timestamp: Date.now(),
        data: updatedBlock,
      }).catch(err => console.error('[useWorkspace] Error triggering webhook:', err));
    }
  };

  const deleteBlock = (pageId: string, blockId: string) => {
    const page = workspace.pages.find(p => p.id === pageId);
    const block = page?.blocks.find(b => b.id === blockId);

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

    // Trigger webhook for block deletion
    if (workspace.id && block) {
      console.log('[useWorkspace] Triggering webhook for block.deleted', { pageId: pageId, blockId: blockId, workspaceId: workspace.id });
      triggerWebhooks(workspace.id, 'block.deleted', {
        event: 'block.deleted',
        workspaceId: workspace.id,
        pageId: pageId,
        blockId: blockId,
        timestamp: Date.now(),
        data: block,
      }).catch(err => console.error('[useWorkspace] Error triggering webhook:', err));
    }
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
    addPageFromTemplate,
    deletePage,
    updatePageTitle,
    updatePageIcon,
    updatePageCover,
    addBlock,
    updateBlock,
    deleteBlock,
  };
};