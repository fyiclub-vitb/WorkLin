import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Trash2, FileText } from 'lucide-react';
import { updatePage, deletePage } from '../lib/firebase/pages';
import { useNavigate } from 'react-router-dom';
export const PageHeader = ({ pageId, initialTitle, onDelete }) => {
    const [title, setTitle] = useState(initialTitle);
    const [showMenu, setShowMenu] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    // Sync local state if props change (e.g. loading a different page)
    useEffect(() => {
        setTitle(initialTitle || 'Untitled Page');
    }, [initialTitle]);
    // Handle clicking outside the menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Debounce save for title (Wait 500ms after typing stops to save)
    useEffect(() => {
        if (title === initialTitle)
            return;
        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            await updatePage(pageId, { title });
            setIsSaving(false);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [title, pageId]); // Note: removed initialTitle from dependency to prevent loop
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this page permanently?')) {
            await deletePage(pageId);
            if (onDelete)
                onDelete();
            navigate('/'); // Go back home after delete
        }
    };
    return (_jsxs("div", { className: "group relative mb-4", children: [_jsxs("div", { className: "flex items-center justify-between h-8 mb-4 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("div", { className: "flex gap-2", children: isSaving && _jsx("span", { className: "text-xs text-gray-400", children: "Saving..." }) }), _jsxs("div", { className: "relative", ref: menuRef, children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), className: "p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors", children: _jsx(MoreHorizontal, { size: 20 }) }), showMenu && (_jsxs("div", { className: "absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50", children: [_jsx("div", { className: "px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Page Options" }), _jsxs("button", { className: "w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2", onClick: () => {
                                            // Add "Copy Link" logic here later
                                            setShowMenu(false);
                                        }, children: [_jsx(FileText, { size: 14 }), "Copy Link"] }), _jsx("div", { className: "h-px bg-gray-100 dark:bg-gray-700 my-1" }), _jsxs("button", { onClick: handleDelete, className: "w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2", children: [_jsx(Trash2, { size: 14 }), "Delete Page"] }), _jsx("div", { className: "px-3 py-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 mt-1", children: "Last edited today" })] }))] })] }), _jsx("div", { className: "relative", children: _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Untitled Page", className: "w-full text-4xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 px-0" }) })] }));
};
