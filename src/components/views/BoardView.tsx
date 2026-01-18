import React, { useMemo } from 'react';
import { Page } from '../../types/workspace';
import { ViewDefinition } from '../../types/view';
import { Plus } from 'lucide-react';

/**
 * Props for the BoardView component
 */
interface BoardViewProps {
    pages: Page[]; // All pages to display
    view: ViewDefinition; // View settings (future: could define custom columns)
    onOpenPage: (pageId: string) => void; // Function to call when opening a page
    onCreatePage?: (title: string, properties?: Record<string, any>) => Promise<void>; // Optional function to create new pages
}

/**
 * BoardView Component (Kanban Board)
 * 
 * This displays pages in a Kanban board layout, similar to Trello or Notion's board view.
 * Pages are organized into columns based on their status property.
 * 
 * Current columns:
 * - No Status: Pages without a status set
 * - To Do: Pages marked as pending
 * - In Progress: Pages currently being worked on
 * - Done: Completed pages
 * 
 * Users can click on pages to open them, and use the "+" button to create new pages
 * directly in a specific status column.
 */
export const BoardView: React.FC<BoardViewProps> = ({ pages, onOpenPage, onCreatePage }) => {
    // State to track which column is showing the new page input
    const [creatingInStatus, setCreatingInStatus] = React.useState<string | null>(null);
    
    // State for the title of the new page being created
    const [newItemTitle, setNewItemTitle] = React.useState('');

    /**
     * Group pages into columns based on their status property
     * 
     * We use useMemo here to avoid recalculating this on every render.
     * It only recalculates when the pages array changes.
     */
    const columns = useMemo(() => {
        // Initialize our column groups
        // In a real app, these might come from user settings or database
        const groups: Record<string, Page[]> = {
            'No Status': [],
            'To Do': [],
            'In Progress': [],
            'Done': [],
        };

        // Loop through each page and put it in the right column
        pages.forEach((page) => {
            // Check if the page has a status property, default to "No Status"
            const status = page.properties?.status || 'No Status';
            
            if (groups[status]) {
                // Add to existing column
                groups[status].push(page);
            } else {
                // If someone set a custom status that's not in our default columns,
                // create a new column for it dynamically
                if (!groups[status]) groups[status] = [];
                groups[status].push(page);
            }
        });

        return groups;
    }, [pages]); // Only recalculate when pages change

    /**
     * Handle creating a new page in a specific status column
     */
    const handleCreateSubmit = async (status: string) => {
        // Don't create if title is empty or no create function provided
        if (!newItemTitle.trim() || !onCreatePage) {
            setCreatingInStatus(null);
            setNewItemTitle('');
            return;
        }

        // Call the create function with the new title and status
        await onCreatePage(newItemTitle, { status });
        
        // Reset the form
        setCreatingInStatus(null);
        setNewItemTitle('');
    };

    /**
     * Handle keyboard shortcuts while creating a new page
     */
    const handleKeyDown = (e: React.KeyboardEvent, status: string) => {
        if (e.key === 'Enter') {
            // Enter key submits the new page
            handleCreateSubmit(status);
        } else if (e.key === 'Escape') {
            // Escape key cancels creation
            setCreatingInStatus(null);
            setNewItemTitle('');
        }
    };

    return (
        // Main container - flexbox for horizontal columns with scrolling
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {/* Loop through each column and render it */}
            {Object.entries(columns).map(([status, groupPages]) => (
                // Each column is a fixed width card that doesn't shrink
                <div key={status} className="flex-shrink-0 w-72 flex flex-col">
                    
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            {/* Color-coded dot to visually distinguish columns */}
                            <span className={`w-2 h-2 rounded-full ${
                                status === 'Done' ? 'bg-green-500' :
                                status === 'In Progress' ? 'bg-blue-500' :
                                status === 'To Do' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            
                            {/* Column name */}
                            {status}
                            
                            {/* Count of pages in this column */}
                            <span className="text-gray-400 ml-1 font-normal">{groupPages.length}</span>
                        </h3>
                        
                        {/* Plus button (currently just for show, could trigger creation) */}
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Column Content - List of Pages */}
                    <div className="space-y-2">
                        {/* Render each page as a card */}
                        {groupPages.map((page) => (
                            <div
                                key={page.id}
                                onClick={() => onOpenPage(page.id)}
                                className="bg-white dark:bg-[#252525] p-3 rounded shadow-sm border border-gray-200 dark:border-[#333] hover:shadow-md transition-shadow cursor-pointer select-none"
                            >
                                {/* Page title with icon */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{page.icon || '📄'}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                        {page.title || 'Untitled'}
                                    </span>
                                </div>
                                
                                {/* Cover image preview if page has one */}
                                {page.cover && (
                                    <div 
                                        className="h-24 w-full bg-cover bg-center rounded mb-2" 
                                        style={{ backgroundImage: `url(${page.cover})` }} 
                                    />
                                )}
                                
                                {/* Additional metadata could go here in the future */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    {/* Future: Could show tags, dates, assignees, etc. */}
                                </div>
                            </div>
                        ))}

                        {/* New Page Creation UI */}
                        {creatingInStatus === status ? (
                            // Show input field when user clicked "New"
                            <div className="bg-white dark:bg-[#252525] p-2 rounded shadow-sm border border-blue-500 dark:border-blue-500">
                                <input
                                    autoFocus // Automatically focus when shown
                                    type="text"
                                    placeholder="Type a name..."
                                    className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, status)}
                                    onBlur={() => handleCreateSubmit(status)} // Submit when clicking away
                                />
                            </div>
                        ) : (
                            // Show "New" button when not creating
                            <button
                                onClick={() => {
                                    setCreatingInStatus(status);
                                    setNewItemTitle('');
                                }}
                                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left transition-colors"
                            >
                                <Plus size={14} />
                                New
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};