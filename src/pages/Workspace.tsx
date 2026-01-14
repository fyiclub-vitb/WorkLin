import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { PageEditor } from '../components/PageEditor';
import { useWorkspace } from '../hooks/useWorkspace';
import { Menu } from 'lucide-react';
import { Toaster } from '../components/ui/toaster';
// FIX 1: Correct the import path (go up one folder to components)
import { PageHeader } from '../components/PageHeader'; 

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
    addBlock,
    updateBlock,
    deleteBlock,
  } = useWorkspace();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is logged in (demo or real)
  useEffect(() => {
    const demoUser = localStorage.getItem('worklin-demo-user');
    if (!demoUser) {
      navigate('/login');
    }
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
      
      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto">
        {currentPage && (
            <>
                {/* FIX 2: Render PageHeader here with layout alignment */}
                <div className="max-w-4xl mx-auto px-12 md:px-24 pt-12 pb-2">
                    <PageHeader 
                        pageId={currentPage.id}
                        initialTitle={currentPage.title}
                        onDelete={() => deletePage(currentPage.id)}
                    />
                </div>

                <PageEditor
                    page={currentPage}
                    onAddBlock={(type) => currentPageId && addBlock(currentPageId, type)}
                    onUpdateBlock={(blockId, updates) =>
                        currentPageId && updateBlock(currentPageId, blockId, updates)
                    }
                    onDeleteBlock={(blockId) =>
                        currentPageId && deleteBlock(currentPageId, blockId)
                    }
                    // We can keep this for fallback, but PageHeader now handles the title
                    onUpdatePageTitle={(title) =>
                        currentPageId && updatePageTitle(currentPageId, title)
                    }
                />
            </>
        )}
      </div>
      
      <Toaster />
    </div>
  );
};