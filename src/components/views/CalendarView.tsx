import React from 'react';
import { Page } from '../../types/workspace';
import { ViewDefinition } from '../../types/view';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

interface CalendarViewProps {
    pages: Page[];
    view: ViewDefinition;
    onOpenPage: (pageId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ pages, onOpenPage }) => {
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days from previous/next months for grid alignment if needed (omitted for simplicity for now)

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col h-[600px]">
            <div className="bg-gray-50 dark:bg-[#252525] px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 text-center bg-gray-50 dark:bg-[#252525]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 gap-px border border-gray-200 dark:border-gray-800">
                {daysInMonth.map((day, idx) => {
                    const dayPages = pages.filter(p => {
                        const createdAt = p.createdAt as any;
                        const pDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt || new Date());
                        return isSameDay(pDate, day);
                    });

                    return (
                        <div
                            key={day.toISOString()}
                            className={`bg-white dark:bg-[#1e1e1e] min-h-[100px] p-2 flex flex-col ${!isSameMonth(day, monthStart) ? 'bg-gray-50 dark:bg-[#252525]' : ''
                                }`}
                        >
                            <div className={`text-right text-xs mb-1 font-medium ${isToday(day)
                                ? 'bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center ml-auto'
                                : 'text-gray-500'
                                }`}>
                                {format(day, 'd')}
                            </div>

                            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                                {dayPages.map(page => (
                                    <div
                                        key={page.id}
                                        onClick={() => onOpenPage(page.id)}
                                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-1 rounded cursor-pointer truncate hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    >
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
