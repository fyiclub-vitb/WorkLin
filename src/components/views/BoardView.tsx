import React, { useMemo } from 'react';
import { Page } from '../../types/workspace';
import { ViewDefinition } from '../../types/view';
import { Plus } from 'lucide-react';

interface BoardViewProps {
    pages: Page[];
    view: ViewDefinition;
    onOpenPage: (pageId: string) => void;
    onCreatePage?: (title: string, properties?: Record<string, any>) => Promise<void>;
}

export const BoardView: React.FC<BoardViewProps> = ({ pages, onOpenPage, onCreatePage }) => {
    // Group pages by status (property) or tags. For now defaults to 'No Status' and 'To Do', 'In Progress', 'Done' if inferred
    const [creatingInStatus, setCreatingInStatus] = React.useState<string | null>(null);
    const [newItemTitle, setNewItemTitle] = React.useState('');

    const columns = useMemo(() => {
        // This logic should ideally be dynamic based on a property configuration
        const groups: Record<string, Page[]> = {
            'No Status': [],
            'To Do': [],
            'In Progress': [],
            'Done': [],
        };

        pages.forEach((page) => {
            // Mock checking a status property
            const status = page.properties?.status || 'No Status';
            if (groups[status]) {
                groups[status].push(page);
            } else {
                // Handle dynamic statuses if we allow them
                if (!groups[status]) groups[status] = [];
                groups[status].push(page);
            }
        });

        return groups;
    }, [pages]);

    const handleCreateSubmit = async (status: string) => {
        if (!newItemTitle.trim() || !onCreatePage) {
            setCreatingInStatus(null);
            setNewItemTitle('');
            return;
        }

        await onCreatePage(newItemTitle, { status });
        setCreatingInStatus(null);
        setNewItemTitle('');
    };

    const handleKeyDown = (e: React.KeyboardEvent, status: string) => {
        if (e.key === 'Enter') {
            handleCreateSubmit(status);
        } else if (e.key === 'Escape') {
            setCreatingInStatus(null);
            setNewItemTitle('');
        }
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
            {Object.entries(columns).map(([status, groupPages]) => (
                <div key={status} className="flex-shrink-0 w-72 flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-green-500' :
                                status === 'In Progress' ? 'bg-blue-500' :
                                    status === 'To Do' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`} />
                            {status}
                            <span className="text-gray-400 ml-1 font-normal">{groupPages.length}</span>
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {groupPages.map((page) => (
                            <div
                                key={page.id}
                                onClick={() => onOpenPage(page.id)}
                                className="bg-white dark:bg-[#252525] p-3 rounded shadow-sm border border-gray-200 dark:border-[#333] hover:shadow-md transition-shadow cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{page.icon || '📄'}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                        {page.title || 'Untitled'}
                                    </span>
                                </div>
                                {page.cover && (
                                    <div className="h-24 w-full bg-cover bg-center rounded mb-2" style={{ backgroundImage: `url(${page.cover})` }} />
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    {/* Additional minimized properties could go here */}
                                </div>
                            </div>
                        ))}

                        {creatingInStatus === status ? (
                            <div className="bg-white dark:bg-[#252525] p-2 rounded shadow-sm border border-blue-500 dark:border-blue-500">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Type a name..."
                                    className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, status)}
                                    onBlur={() => handleCreateSubmit(status)}
                                />
                            </div>
                        ) : (
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
