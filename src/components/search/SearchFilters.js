import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Calendar, User, Tag, FileType } from 'lucide-react';
export const SearchFilters = ({ filters, onChange, onClear }) => {
    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };
    const handleDateChange = (type, dateStr) => {
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
    return (_jsxs("div", { className: "space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium text-sm text-muted-foreground", children: "Filters" }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: onClear, className: "h-8 px-2 text-xs", children: [_jsx(X, { className: "w-3 h-3 mr-1" }), "Clear all"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("label", { className: "text-xs font-medium flex items-center gap-2", children: [_jsx(User, { className: "w-3 h-3" }), " Author ID"] }), _jsx(Input, { placeholder: "User ID...", value: filters.authorId || '', onChange: (e) => handleChange('authorId', e.target.value), className: "h-8 text-sm" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("label", { className: "text-xs font-medium flex items-center gap-2", children: [_jsx(FileType, { className: "w-3 h-3" }), " Page Type"] }), _jsxs("select", { className: "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", value: filters.type || '', onChange: (e) => handleChange('type', e.target.value), children: [_jsx("option", { value: "", children: "Any" }), _jsx("option", { value: "document", children: "Document" }), _jsx("option", { value: "canvas", children: "Canvas" }), _jsx("option", { value: "kanban", children: "Kanban" })] })] }), _jsxs("div", { className: "space-y-1 md:col-span-2", children: [_jsxs("label", { className: "text-xs font-medium flex items-center gap-2", children: [_jsx(Tag, { className: "w-3 h-3" }), " Tags (comma separated)"] }), _jsx(Input, { placeholder: "project, urgent, design...", value: filters.tags?.join(', ') || '', onChange: (e) => {
                                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                    handleChange('tags', tags);
                                }, className: "h-8 text-sm" })] }), _jsxs("div", { className: "space-y-1 md:col-span-2", children: [_jsxs("label", { className: "text-xs font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "w-3 h-3" }), " Updated Date Range"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { type: "date", className: "h-8 text-sm", value: filters.dateRange?.start instanceof Date ? filters.dateRange.start.toISOString().split('T')[0] : '', onChange: (e) => handleDateChange('start', e.target.value) }), _jsx("span", { className: "text-muted-foreground", children: "-" }), _jsx(Input, { type: "date", className: "h-8 text-sm", value: filters.dateRange?.end instanceof Date ? filters.dateRange.end.toISOString().split('T')[0] : '', onChange: (e) => handleDateChange('end', e.target.value) })] })] })] })] }));
};
