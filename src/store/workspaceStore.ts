import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Page, Block, Workspace } from '../types/workspace';

// Central client-side store for "current session" state.
//
// Goal: keep UI components dumb by putting view-friendly state here, while the
// source of truth for persisted data stays in Firestore.
//
// A couple of fields (like `currentPage`) are derived from other fields for
// convenience, so callers don't have to recompute on every render.

interface WorkspaceState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Workspace
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  
  // Pages
  pages: Page[];
  setPages: (pages: Page[]) => void;
  addPage: (page: Page) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  
  // Current page
  currentPageId: string | null;
  setCurrentPageId: (pageId: string | null) => void;
  currentPage: Page | null;
  
  // Blocks
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  addBlock: (block: Block) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Workspace
  currentWorkspace: null,
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  // Pages
  pages: [],
  setPages: (pages) => set({ pages }),
  addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
  updatePage: (pageId, updates) =>
    set((state) => ({
      pages: state.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
    })),
  deletePage: (pageId) =>
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== pageId),
      // If the current page is deleted, force the editor back to a safe state.
      currentPageId: state.currentPageId === pageId ? null : state.currentPageId,
    })),

  // Current page
  currentPageId: null,
  setCurrentPageId: (pageId) =>
    set({
      currentPageId: pageId,
      // Cache the selected page object for quick reads in the UI.
      currentPage: get().pages.find((p) => p.id === pageId) || null,
    }),
  currentPage: null,

  // Blocks
  blocks: [],
  setBlocks: (blocks) => set({ blocks }),
  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  updateBlock: (blockId, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    })),
  deleteBlock: (blockId) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== blockId),
    })),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Loading
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
