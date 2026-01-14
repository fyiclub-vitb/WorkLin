import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { PageEditor } from '../components/PageEditor';
import { useWorkspace } from '../hooks/useWorkspace';
import { Menu } from 'lucide-react';
import { Toaster } from '../components/ui/toaster';

export const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const {
    workspace,
    currentPage,
    currentPageId,
    setCurrentPageId,
    addPage,
    deletePage,
    updatePageTitle,
    updatePageCover,
    addBlock,
    updateBlock,
    deleteBlock,
  } = useWorkspace();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is logged in (demo or real)
  useEffect(() => {
    const demoUser = localStorage.getItem('worklin-demo-user');
    if (!demoUser) {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // The search hook in Sidebar handles focus, 
        // but we might want to ensure Sidebar is open here if we wanted strictly global control
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
        currentPageId={currentPageId}
        onSelectPage={setCurrentPageId}
        onAddPage={() => addPage()}
        onDeletePage={(pageId) => {
          if (confirm('Are you sure you want to delete this page?')) {
            deletePage(pageId);
          }
        }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <PageEditor
        page={currentPage}
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
          currentPageId && updatePageCover(currentPageId, url)
        }
      />
      <Toaster />
    </div>
  );
};