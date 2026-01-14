import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getPageHistory, restoreVersion, reconstructPageAtVersion } from '../lib/firebase/history';
import { Clock, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export const VersionHistory = ({ pageId, currentUserId, onClose, onRestore }) => {
    const [history, setHistory] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [previewPage, setPreviewPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState(false);
    useEffect(() => {
        loadHistory();
    }, [pageId]);
    const loadHistory = async () => {
        try {
            setLoading(true);
            const entries = await getPageHistory(pageId);
            setHistory(entries);
        }
        catch (error) {
            console.error('Failed to load history:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleVersionSelect = async (version) => {
        setSelectedVersion(version);
        try {
            const page = await reconstructPageAtVersion(pageId, version.id);
            setPreviewPage(page);
        }
        catch (error) {
            console.error('Failed to preview version:', error);
        }
    };
    const handleRestore = async () => {
        if (!selectedVersion)
            return;
        const confirmed = window.confirm('Are you sure you want to restore this version? This will create a new version with the restored content.');
        if (!confirmed)
            return;
        try {
            setRestoring(true);
            await restoreVersion(pageId, selectedVersion.id, currentUserId);
            onRestore?.();
            onClose();
        }
        catch (error) {
            console.error('Failed to restore version:', error);
            alert('Failed to restore version. Please try again.');
        }
        finally {
            setRestoring(false);
        }
    };
    const formatDate = (date) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(d);
    };
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, onClick: (e) => e.stopPropagation(), className: "bg-white dark:bg-[#1e1e1e] rounded-lg shadow-2xl max-w-6xl w-full h-[80vh] flex overflow-hidden", children: [_jsxs("div", { className: "w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 20, className: "text-gray-500" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Version History" })] }), _jsx("button", { onClick: onClose, className: "p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors", children: _jsx(X, { size: 20, className: "text-gray-500" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? (_jsx("div", { className: "flex items-center justify-center h-32", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) })) : history.length === 0 ? (_jsx("div", { className: "p-4 text-center text-gray-500", children: "No version history available" })) : (_jsx("div", { className: "p-2", children: history.map((version) => (_jsx("button", { onClick: () => handleVersionSelect(version), className: `w-full text-left p-3 rounded-lg mb-2 transition-colors ${selectedVersion?.id === version.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`, children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0", children: version.authorName?.[0]?.toUpperCase() || 'U' }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: version.authorName || 'Unknown' }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mt-0.5", children: formatDate(version.createdAt) }), version.restoreVersionId && (_jsx("div", { className: "text-xs text-blue-600 dark:text-blue-400 mt-1", children: "Restored version" }))] })] }) }, version.id))) })) })] }), _jsx("div", { className: "flex-1 flex flex-col", children: selectedVersion ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Preview" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: formatDate(selectedVersion.createdAt) })] }), _jsxs("button", { onClick: handleRestore, disabled: restoring, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm font-medium", children: [_jsx(RotateCcw, { size: 16 }), restoring ? 'Restoring...' : 'Restore Version'] })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3", children: "Changes" }), Object.entries(selectedVersion.diff).map(([field, change]) => (_jsxs("div", { className: "border border-gray-200 dark:border-gray-700 rounded-lg p-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize", children: field }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded", children: [_jsx("div", { className: "text-xs text-red-600 dark:text-red-400 font-medium mb-1", children: "Before" }), _jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 font-mono", children: typeof change.before === 'object'
                                                                            ? JSON.stringify(change.before, null, 2)
                                                                            : String(change.before) })] }), _jsxs("div", { className: "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded", children: [_jsx("div", { className: "text-xs text-green-600 dark:text-green-400 font-medium mb-1", children: "After" }), _jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100 font-mono", children: typeof change.after === 'object'
                                                                            ? JSON.stringify(change.after, null, 2)
                                                                            : String(change.after) })] })] })] }, field)))] }) })] })) : (_jsx("div", { className: "flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400", children: _jsxs("div", { className: "text-center", children: [_jsx(Clock, { size: 48, className: "mx-auto mb-4 opacity-50" }), _jsx("p", { children: "Select a version to preview changes" })] }) })) })] }) }) }));
};
