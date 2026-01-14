import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { addComment, subscribeToComments, resolveComment, deleteComment } from '../../lib/firebase/comments';
import { CommentBubble } from './CommentBubble';
import { Send, X } from 'lucide-react';
export const CommentThread = ({ blockId, onClose }) => {
    const { user } = useWorkspaceStore();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    // Subscribe to comments for this block
    useEffect(() => {
        const unsubscribe = subscribeToComments(blockId, (fetchedComments) => {
            setComments(fetchedComments);
        });
        return () => unsubscribe();
    }, [blockId]);
    // Scroll to bottom when new comments arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user)
            return;
        setLoading(true);
        await addComment(blockId, {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL
        }, newComment);
        setNewComment('');
        setLoading(false);
    };
    const activeComments = comments.filter(c => !c.resolved);
    const resolvedComments = comments.filter(c => c.resolved);
    return (_jsxs("div", { className: "w-80 bg-white dark:bg-[#1e1e1e] border-l border-gray-200 dark:border-gray-800 flex flex-col h-[400px] shadow-xl rounded-lg overflow-hidden border", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900", children: [_jsx("h3", { className: "font-semibold text-gray-900 dark:text-gray-100 text-sm", children: "Comments" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200", children: _jsx(X, { size: 16 }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-gray-900/50", children: [activeComments.length === 0 && resolvedComments.length === 0 && (_jsx("div", { className: "text-center text-gray-400 py-8 text-xs", children: "No comments yet" })), activeComments.map(comment => (_jsx(CommentBubble, { comment: comment, currentUserId: user?.uid, onResolve: () => resolveComment(comment.id, true), onDelete: () => deleteComment(comment.id) }, comment.id))), resolvedComments.length > 0 && (_jsxs("div", { className: "relative py-2", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-200 dark:border-gray-700" }) }), _jsx("div", { className: "relative flex justify-center text-xs", children: _jsx("span", { className: "px-2 bg-gray-50 dark:bg-[#1e1e1e] text-gray-400", children: "Resolved" }) })] })), resolvedComments.map(comment => (_jsx(CommentBubble, { comment: comment, currentUserId: user?.uid, onResolve: () => resolveComment(comment.id, false), onDelete: () => deleteComment(comment.id) }, comment.id))), _jsx("div", { ref: messagesEndRef })] }), _jsx("div", { className: "p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900", children: _jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2", children: [_jsx("input", { type: "text", value: newComment, onChange: (e) => setNewComment(e.target.value), placeholder: "Write a comment...", className: "flex-1 px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { type: "submit", disabled: !newComment.trim() || loading, className: "p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: _jsx(Send, { size: 14 }) })] }) })] }));
};
