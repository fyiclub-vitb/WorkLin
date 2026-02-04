import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, Download } from 'lucide-react';

/**
 * UpdatePrompt - Shows when a new service worker update is available
 * 
 * This component listens for service worker updates and prompts
 * the user to refresh for the latest version.
 */

interface UpdatePromptProps {
    registration?: ServiceWorkerRegistration;
}

export const UpdatePrompt: React.FC<UpdatePromptProps> = ({ registration }) => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Listen for service worker updates
    useEffect(() => {
        if (!registration) return;

        const handleUpdate = () => {
            if (registration.waiting) {
                setShowPrompt(true);
            }
        };

        // Check if there's already a waiting worker
        if (registration.waiting) {
            setShowPrompt(true);
        }

        registration.addEventListener('updatefound', handleUpdate);

        return () => {
            registration.removeEventListener('updatefound', handleUpdate);
        };
    }, [registration]);

    // Listen for controller change (after skipWaiting)
    useEffect(() => {
        const handleControllerChange = () => {
            window.location.reload();
        };

        navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

        return () => {
            navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
        };
    }, []);

    const handleUpdate = () => {
        setIsUpdating(true);

        if (registration?.waiting) {
            // Tell the waiting worker to activate
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-safe left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 mt-4"
            >
                <div className="bg-blue-600 dark:bg-blue-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <Download size={20} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white">
                                Update Available
                            </h3>
                            <p className="text-sm text-blue-100 truncate">
                                A new version is ready to install
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleUpdate}
                                disabled={isUpdating}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors disabled:opacity-70"
                            >
                                {isUpdating ? (
                                    <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={16} />
                                )}
                                {isUpdating ? 'Updating...' : 'Update'}
                            </motion.button>

                            <button
                                onClick={handleDismiss}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Dismiss"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UpdatePrompt;
