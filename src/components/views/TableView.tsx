import React from 'react';
import { Page } from '../../types/workspace';
import { ViewDefinition } from '../../types/view';
import { Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Props for the TableView component
 */
interface TableViewProps {
    pages: Page[]; // All the pages to display in the table
    view: ViewDefinition; // View configuration (not currently used but kept for future features like sorting/filtering)
    onOpenPage: (pageId: string) => void; // Callback when user clicks a row to open that page
}

/**
 * TableView Component
 * 
 * Displays pages in a traditional table format, similar to a spreadsheet or database view.
 * This is one of three view modes (Table, Board, Calendar) for organizing pages.
 * 
 * The table shows:
 * - Page name (with icon)
 * - Tags
 * - Creation date
 * 
 * Users can click any row to open that page in the editor.
 */
export const TableView: React.FC<TableViewProps> = ({ pages, onOpenPage }) => {
    return (
        // Wrapper div with horizontal scroll for narrow screens
        // This prevents the table from breaking the layout on mobile
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm text-left">
                {/* Table Header */}
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                        {/* Name column takes up half the table width */}
                        <th className="py-2 px-4 font-medium w-1/2">Name</th>
                        
                        {/* Tags and Created columns each take a quarter */}
                        <th className="py-2 px-4 font-medium w-1/4">Tags</th>
                        <th className="py-2 px-4 font-medium w-1/4">Created</th>
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {/* Loop through each page and create a row */}
                    {pages.map((page) => (
                        <tr
                            key={page.id}
                            onClick={() => onOpenPage(page.id)} // Open page when row is clicked
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                            {/* Name Column */}
                            <td className="py-2 px-4">
                                <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                    {/* Page icon (emoji or default document icon) */}
                                    <span className="text-lg">{page.icon || '📄'}</span>
                                    
                                    {/* Page title, falls back to "Untitled" if empty */}
                                    {page.title || 'Untitled'}
                                </div>
                            </td>

                            {/* Tags Column */}
                            <td className="py-2 px-4">
                                <div className="flex flex-wrap gap-1">
                                    {/* Show all tags as colored badges */}
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
                                        // Show dash if no tags exist
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </div>
                            </td>

                            {/* Created Date Column */}
                            <td className="py-2 px-4 text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    {/* Calendar icon to indicate it's a date */}
                                    <Calendar size={14} />
                                    
                                    {/* Format the date nicely (e.g., "Jan 15, 2024") */}
                                    {/* Firebase timestamps have a toDate() method, regular Date objects don't */}
                                    {page.createdAt ? (
                                        format(
                                            (page.createdAt as any)?.toDate 
                                                ? (page.createdAt as any).toDate() 
                                                : new Date(page.createdAt), 
                                            'MMM d, yyyy'
                                        )
                                    ) : (
                                        // Show dash if creation date is missing
                                        '-'
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Empty State */}
                    {/* Show this row when there are no pages to display */}
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