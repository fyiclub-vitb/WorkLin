import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Smartphone } from 'lucide-react';

/**
 * InstallPrompt - PWA Install Banner for mobile devices
 * 
 * This component shows an install prompt when:
 * 1. The app is not already installed
 * 2. The browser supports PWA installation
 * 3. The user hasn't dismissed the prompt recently
 * 
 * Features:
 * - Deferred installation prompt (captures beforeinstallprompt event)
 * - Smart dismissal with local storage persistence
 * - iOS-specific instructions (since iOS doesn't support beforeinstallprompt)
 * - Smooth animations
 */

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
    delay?: number; // Delay before showing prompt (ms)
    dismissDuration?: number; // How long to hide after dismiss (days)
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
    delay = 30000, // 30 seconds default
    dismissDuration = 7, // 7 days default
}) => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    // Check if app is already installed or running as PWA
    useEffect(() => {
        const checkInstallState = () => {
            // Check if running as standalone (installed PWA)
            const standalone = window.matchMedia('(display-mode: standalone)').matches
                || (window.navigator as any).standalone === true;
            setIsStandalone(standalone);

            // Check if iOS
            const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            setIsIOS(iOS);
        };

        checkInstallState();
    }, []);

    // Check if prompt was recently dismissed
    const wasRecentlyDismissed = useCallback(() => {
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (!dismissedAt) return false;

        const dismissedDate = new Date(parseInt(dismissedAt, 10));
        const daysSinceDismiss = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceDismiss < dismissDuration;
    }, [dismissDuration]);

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    useEffect(() => {
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    // Show prompt after delay if conditions are met
    useEffect(() => {
        if (isStandalone || wasRecentlyDismissed()) return;

        const timer = setTimeout(() => {
            // Show for iOS or when we have a deferred prompt
            if (isIOS || deferredPrompt) {
                setShowPrompt(true);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, deferredPrompt, isIOS, isStandalone, wasRecentlyDismissed]);

    // Handle install click
    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('[PWA] User accepted the install prompt');
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('[PWA] Error during installation:', error);
        }

        setDeferredPrompt(null);
    };

    // Handle dismiss
    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        setShowPrompt(false);
    };

    // Don't render if already installed or shouldn't show
    if (isStandalone || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <Smartphone size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    Install WorkLin
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Add to home screen
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {isIOS ? (
                            // iOS-specific instructions
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Install WorkLin for the best experience:
                                </p>
                                <ol className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600">1.</span>
                                        <span>
                                            Tap the share button{' '}
                                            <Share size={14} className="inline-block text-blue-600" />
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600">2.</span>
                                        <span>Scroll down and tap "Add to Home Screen"</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600">3.</span>
                                        <span>Tap "Add" to install</span>
                                    </li>
                                </ol>
                            </div>
                        ) : (
                            // Android/Chrome install button
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Install WorkLin for quick access and offline support.
                                </p>
                                <button
                                    onClick={handleInstall}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    <Download size={18} />
                                    Install App
                                </button>
                            </div>
                        )}

                        {/* Benefits list */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-green-500 rounded-full" />
                                    Works offline
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-green-500 rounded-full" />
                                    Faster loading
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-green-500 rounded-full" />
                                    Full screen experience
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPrompt;
