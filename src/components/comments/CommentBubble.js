import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, Trash2, User } from 'lucide-react';
export const CommentBubble = ({ comment, currentUserId, onResolve, onDelete, }) => {
    const isOwner = currentUserId === comment.userId;
    // Format date safely without external libraries
    const formatDate = (timestamp) => {
        if (!timestamp)
            return '';
        // Handle Firestore Timestamp or standard Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
        }).format(date);
    };
    return (_jsxs("div", { className: `p-3 rounded-lg border ${comment.resolved ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} shadow-sm text-sm group relative`, children: [_jsxs("div", { className: "flex items-start gap-2 mb-1", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0", children: comment.userPhotoURL ? (_jsx("img", { src: comment.userPhotoURL, alt: comment.userName, className: "w-full h-full object-cover" })) : (_jsx(User, { size: 14, className: "text-gray-500" })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100 truncate", children: comment.userName }), _jsx("span", { className: "text-xs text-gray-500 whitespace-nowrap", children: formatDate(comment.createdAt) })] }), _jsx("p", { className: `text-gray-700 dark:text-gray-300 mt-1 break-words ${comment.resolved ? 'line-through text-gray-400' : ''}`, children: comment.content })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: onResolve, className: `p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${comment.resolved ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`, title: comment.resolved ? "Unresolve" : "Resolve", children: _jsx(Check, { size: 14 }) }), isOwner && (_jsx("button", { onClick: onDelete, className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600", title: "Delete", children: _jsx(Trash2, { size: 14 }) }))] })] }));
};
