import React from 'react';
import { SearchFilters as SearchFiltersType } from '../../lib/firebase/search';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Calendar, User, Tag, FileType } from 'lucide-react';

interface Props {
    filters: Partial<SearchFiltersType>;
    onChange: (filters: Partial<SearchFiltersType>) => void;
    onClear: () => void;
}

// This component shows all the filter options for search
export const SearchFilters = ({ filters, onChange, onClear }: Props) => {
    // Update a specific filter field
    const handleChange = (key: keyof SearchFiltersType, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    // Handle date range changes
    const handleDateChange = (type: 'start' | 'end', dateStr: string) => {
        const date = dateStr ? new Date(dateStr) : null;
        const currentRange = filters.dateRange || { start: null, end: null };
        onChange({
            ...filters,
            dateRange: {
                ...currentRange,
                [type]: date
            }
        });
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">Filters</h3>
                <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2 text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Clear all
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filter by author/user ID */}
                <div className="space-y-1">
                    <label className="text-xs font-medium flex items-center gap-2">
                        <User className="w-3 h-3" /> Author ID
                    </label>
                    <Input
                        placeholder="User ID..."
                        value={filters.authorId || ''}
                        onChange={(e) => handleChange('authorId', e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>

                {/* Filter by page type */}
                <div className="space-y-1">
                    <label className="text-xs font-medium flex items-center gap-2">
                        <FileType className="w-3 h-3" /> Page Type
                    </label>
                    <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.type || ''}
                        onChange={(e) => handleChange('type', e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="document">Document</option>
                        <option value="canvas">Canvas</option>
                        <option value="kanban">Kanban</option>
                    </select>
                </div>

                {/* Filter by tags */}
                <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Tags (comma separated)
                    </label>
                    <Input
                        placeholder="project, urgent, design..."
                        value={filters.tags?.join(', ') || ''}
                        onChange={(e) => {
                            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                            handleChange('tags', tags);
                        }}
                        className="h-8 text-sm"
                    />
                </div>

                {/* Filter by date range */}
                <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Updated Date Range
                    </label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="h-8 text-sm"
                            value={filters.dateRange?.start instanceof Date ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            className="h-8 text-sm"
                            value={filters.dateRange?.end instanceof Date ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};