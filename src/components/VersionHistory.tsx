import React, { useState, useEffect } from 'react';
import { HistoryEntry } from '../types/history';
import { getPageHistory, restoreVersion, reconstructPageAtVersion } from '../lib/firebase/history';
import { Page } from '../types/workspace';
import { Clock, RotateCcw, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VersionHistoryProps {
    pageId: string;
    currentUserId: string;
    onClose: () => void;
    onRestore?: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
    pageId,
    currentUserId,
    onClose,
    onRestore
}) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<HistoryEntry | null>(null);
    const [previewPage, setPreviewPage] = useState<Page | null>(null);
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
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVersionSelect = async (version: HistoryEntry) => {
        setSelectedVersion(version);
        try {
            const page = await reconstructPageAtVersion(pageId, version.id);
            setPreviewPage(page);
        } catch (error) {
            console.error('Failed to preview version:', error);
        }
    };

    const handleRestore = async () => {
        if (!selectedVersion) return;

        const confirmed = window.confirm(
            'Are you sure you want to restore this version? This will create a new version with the restored content.'
        );

        if (!confirmed) return;

        try {
            setRestoring(true);
            await restoreVersion(pageId, selectedVersion.id, currentUserId);
            onRestore?.();
            onClose();
        } catch (error) {
            console.error('Failed to restore version:', error);
            alert('Failed to restore version. Please try again.');
        } finally {
            setRestoring(false);
        }
    };

    const formatDate = (date: Date | any) => {
        const d = date?.toDate ? date.toDate() : new Date(date);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(d);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-2xl max-w-6xl w-full h-[80vh] flex overflow-hidden"
                >
                    {/* Timeline Sidebar */}
                    <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Version History
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No version history available
                                </div>
                            ) : (
                                <div className="p-2">
                                    {history.map((version) => (
                                        <button
                                            key={version.id}
                                            onClick={() => handleVersionSelect(version)}
                                            className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${selectedVersion?.id === version.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                                    {version.authorName?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {version.authorName || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {formatDate(version.createdAt)}
                                                    </div>
                                                    {version.restoreVersionId && (
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                            Restored version
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="flex-1 flex flex-col">
                        {selectedVersion ? (
                            <>
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Preview
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(selectedVersion.createdAt)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleRestore}
                                        disabled={restoring}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm font-medium"
                                    >
                                        <RotateCcw size={16} />
                                        {restoring ? 'Restoring...' : 'Restore Version'}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {/* Diff View */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Changes
                                        </h4>
                                        {Object.entries(selectedVersion.diff).map(([field, change]) => (
                                            <div
                                                key={field}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                            >
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                                    {field}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
                                                        <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                                                            Before
                                                        </div>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                                            {typeof change.before === 'object'
                                                                ? JSON.stringify(change.before, null, 2)
                                                                : String(change.before)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                                                        <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                                                            After
                                                        </div>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                                            {typeof change.after === 'object'
                                                                ? JSON.stringify(change.after, null, 2)
                                                                : String(change.after)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Select a version to preview changes</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
