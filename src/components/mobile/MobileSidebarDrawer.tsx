import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Plus } from 'lucide-react';

/**
 * MobileSidebarDrawer - A full-screen drawer that slides in from the left
 * 
 * This replaces the regular sidebar on mobile devices with a more
 * touch-friendly, full-screen experience.
 * 
 * Features:
 * - Swipe-left to close
 * - Tap backdrop to close
 * - Animated entrance/exit
 * - iOS-style appearance
 */

interface MobileSidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    onAdd?: () => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
    isOpen,
    onClose,
    children,
    title = 'Pages',
    onAdd,
}) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when drawer is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle swipe to close
    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (info.offset.x < -100 || info.velocity.x < -500) {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={{ left: 0.2, right: 0 }}
                        onDragEnd={handleDragEnd}
                        className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 z-50 lg:hidden"
                        style={{ touchAction: 'pan-y' }}
                    >
                        {/* Safe area padding */}
                        <div className="h-full flex flex-col pt-safe">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {onAdd && (
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={onAdd}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            aria-label="Add new page"
                                        >
                                            <Plus size={20} className="text-gray-700 dark:text-gray-300" />
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        aria-label="Close menu"
                                    >
                                        <X size={20} className="text-gray-700 dark:text-gray-300" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto pb-safe">
                                {children}
                            </div>
                        </div>

                        {/* Drag handle indicator */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mr-2 opacity-50" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileSidebarDrawer;
