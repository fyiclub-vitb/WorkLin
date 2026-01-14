import { create } from 'zustand';
export const useWorkspaceStore = create((set, get) => ({
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
    updatePage: (pageId, updates) => set((state) => ({
        pages: state.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
    })),
    deletePage: (pageId) => set((state) => ({
        pages: state.pages.filter((p) => p.id !== pageId),
        currentPageId: state.currentPageId === pageId ? null : state.currentPageId,
    })),
    // Current page
    currentPageId: null,
    setCurrentPageId: (pageId) => set({
        currentPageId: pageId,
        currentPage: get().pages.find((p) => p.id === pageId) || null,
    }),
    currentPage: null,
    // Blocks
    blocks: [],
    setBlocks: (blocks) => set({ blocks }),
    addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
    updateBlock: (blockId, updates) => set((state) => ({
        blocks: state.blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
    })),
    deleteBlock: (blockId) => set((state) => ({
        blocks: state.blocks.filter((b) => b.id !== blockId),
    })),
    // UI State
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    // Loading
    loading: false,
    setLoading: (loading) => set({ loading }),
}));
