import React from 'react';
import { Page } from '../../types/workspace';
import { ViewDefinition } from '../../types/view';
import { Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface TableViewProps {
    pages: Page[];
    view: ViewDefinition;
    onOpenPage: (pageId: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({ pages, onOpenPage }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                        <th className="py-2 px-4 font-medium w-1/2">Name</th>
                        <th className="py-2 px-4 font-medium w-1/4">Tags</th>
                        <th className="py-2 px-4 font-medium w-1/4">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {pages.map((page) => (
                        <tr
                            key={page.id}
                            onClick={() => onOpenPage(page.id)}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                            <td className="py-2 px-4">
                                <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                    <span className="text-lg">{page.icon || '📄'}</span>
                                    {page.title || 'Untitled'}
                                </div>
                            </td>
                            <td className="py-2 px-4">
                                <div className="flex flex-wrap gap-1">
                                    {page.tags && page.tags.length > 0 ? (
                                        page.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-4 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {page.createdAt ? (
                                        format((page.createdAt as any)?.toDate ? (page.createdAt as any).toDate() : new Date(page.createdAt), 'MMM d, yyyy')
                                    ) : (
                                        '-'
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {pages.length === 0 && (
                        <tr>
                            <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No items found. Create a new page to get started.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
