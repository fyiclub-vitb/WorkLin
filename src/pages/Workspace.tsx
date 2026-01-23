// src/pages/Workspace.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { PageEditor } from '../components/PageEditor';
import { FullTextSearch } from '../components/search/FullTextSearch';
import { AnalyticsDashboard } from '../components/analytics/Dashboard';
import { useWorkspace } from '../hooks/useWorkspace';
import { Menu } from 'lucide-react';
import { Toaster } from '../components/ui/toaster';
import { PageHeader } from '../components/PageHeader';
import { subscribeToAuth } from '../lib/firebase/auth';

export const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchView = location.pathname === '/app/search';
  const isAnalyticsView = location.pathname === '/app/analytics';

  const {
    workspace,
    archivedPages,
    currentPage,
    currentPageId,
    setCurrentPageId,
    addPage,
    deletePage,
    restorePage,
    permanentlyDeletePage,
    updatePageTitle,
    updatePageIcon,
    updatePageCover,
    addBlock,
    updateBlock,
    deleteBlock,
    updatePageProperties,
  } = useWorkspace();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is logged in (Firebase auth)
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close sidebar on mobile when page is selected
  useEffect(() => {
    if (window.innerWidth < 1024 && currentPageId) {
      setSidebarOpen(false);
    }
  }, [currentPageId]);

  return (
    <div className="flex h-screen bg-white dark:bg-[#1e1e1e] overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Menu size={20} className="text-gray-700 dark:text-gray-300" />
      </button>

      <Sidebar
        pages={workspace.pages}
        archivedPages={archivedPages}
        currentPageId={currentPageId}
        onSelectPage={(pageId) => {
          if (pageId) {
            setCurrentPageId(pageId);
            if (isAnalyticsView || isSearchView) {
              navigate('/app');
            }
          } else {
            // Clear selection and navigate to home
            setCurrentPageId(null);
            navigate('/app');
          }
        }}
        onAddPage={() => addPage()}
        onDeletePage={(pageId) => {
          if (confirm('Are you sure you want to move this page to trash?')) {
            deletePage(pageId);
          }
        }}
        onRestorePage={(pageId) => restorePage(pageId)}
        onPermanentlyDeletePage={(pageId) => {
          if (confirm('Are you sure you want to permanently delete this page? This action cannot be undone.')) {
            permanentlyDeletePage(pageId);
          }
        }}
        onUpdatePage={(pageId, icon) => updatePageIcon(pageId, icon)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      {isSearchView ? (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1e1e1e] p-8">
          <FullTextSearch />
        </div>
      ) : isAnalyticsView ? (
        // Render Analytics Dashboard taking full available width/height
        <div className="flex-1 h-full overflow-hidden relative">
          <AnalyticsDashboard />
        </div>
      ) : (
        // Standard Page Editor View
        <div className="flex-1 h-full overflow-hidden">
          {currentPage && (
            <PageEditor
              page={currentPage}
              allPages={workspace.pages} // FIX: Pass workspace.pages as allPages
              onAddBlock={(type) => currentPageId && addBlock(currentPageId, type)}
              onUpdateBlock={(blockId, updates) =>
                currentPageId && updateBlock(currentPageId, blockId, updates)
              }
              onDeleteBlock={(blockId) =>
                currentPageId && deleteBlock(currentPageId, blockId)
              }
              onUpdatePageTitle={(title) =>
                currentPageId && updatePageTitle(currentPageId, title)
              }
              onUpdatePageCover={(url) =>
                currentPageId && updatePageCover(currentPageId, url || null)
              }
              onUpdatePage={(pageId, updates) => {
                updatePageProperties(pageId, updates.properties);
              }}
            />
          )}
          {!currentPage && !currentPageId && (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-center max-w-md px-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No page selected
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Select a page from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={() => addPage()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  Create New Page
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Toaster />
    </div>
  );
};