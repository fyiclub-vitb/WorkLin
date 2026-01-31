import React from 'react';
import { Page } from '../../types/workspace';
import { ViewDefinition } from '../../types/view';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

/**
 * Props for the CalendarView component
 */
interface CalendarViewProps {
    pages: Page[]; // All pages to display on the calendar
    view: ViewDefinition; // View configuration (not currently used)
    onOpenPage: (pageId: string) => void; // Callback when user clicks on a page
}

/**
 * CalendarView Component
 * 
 * Displays pages in a monthly calendar view, where each page appears on the day it was created.
 * This is useful for seeing your work timeline and when different pages were created.
 * 
 * Features:
 * - Shows current month's calendar grid
 * - Highlights today's date
 * - Groups pages by creation date
 * - Click on any page to open it
 */
export const CalendarView: React.FC<CalendarViewProps> = ({ pages, onOpenPage }) => {
    // Get the current date (this determines which month we show)
    const currentDate = new Date();
    
    // Calculate the first and last day of the current month
    // For example, if it's January 15, monthStart = Jan 1, monthEnd = Jan 31
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Generate an array of all days in the current month
    // This gives us [Jan 1, Jan 2, Jan 3, ..., Jan 31]
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Note: A more complete calendar would add padding days from the previous/next months
    // to fill the grid properly (usually calendars show 6 weeks = 42 days)
    // That's omitted here for simplicity but could be added later

    return (
        // Main container with fixed height and border
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col h-[600px]">
            
            {/* Calendar Header - Shows month and year */}
            <div className="bg-gray-50 dark:bg-[#252525] px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {/* Format as "January 2024" */}
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                {/* Future: Could add prev/next month buttons here */}
            </div>

            {/* Day Names Header - Sun, Mon, Tue, etc. */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 text-center bg-gray-50 dark:bg-[#252525]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid - The actual days */}
            {/* 7 columns for 7 days of the week */}
            <div className="grid grid-cols-7 flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 gap-px border border-gray-200 dark:border-gray-800">
                {daysInMonth.map((day, idx) => {
                    // Find all pages created on this specific day
                    const dayPages = pages.filter(p => {
                        // Get the page's creation date
                        const createdAt = p.createdAt as any;
                        
                        // Handle both Firebase Timestamps and regular Date objects
                        const pDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt || new Date());
                        
                        // Check if the page was created on this day
                        return isSameDay(pDate, day);
                    });

                    return (
                        // Each calendar cell
                        <div
                            key={day.toISOString()}
                            className={`bg-white dark:bg-[#1e1e1e] min-h-[100px] p-2 flex flex-col ${
                                // Gray out days that aren't in the current month (if we add padding days)
                                !isSameMonth(day, monthStart) ? 'bg-gray-50 dark:bg-[#252525]' : ''
                            }`}
                        >
                            {/* Day Number */}
                            <div className={`text-right text-xs mb-1 font-medium ${
                                isToday(day)
                                    // Today gets a special red circle highlight
                                    ? 'bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center ml-auto'
                                    // Other days are just gray text
                                    : 'text-gray-500'
                            }`}>
                                {format(day, 'd')} {/* Just the day number (1-31) */}
                            </div>

                            {/* List of pages for this day */}
                            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                                {dayPages.map(page => (
                                    <div
                                        key={page.id}
                                        onClick={() => onOpenPage(page.id)}
                                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded cursor-pointer truncate hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        {/* Show page icon and title */}
                                        <span className="mr-1">{page.icon}</span>
                                        {page.title || 'Untitled'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};