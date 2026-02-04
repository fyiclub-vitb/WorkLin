import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
    ChevronLeft,
    Menu,
    MoreVertical,
    Share,
    Star,
    StarOff,
    Edit3,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * MobileHeader - A mobile-optimized header component
 * 
 * Features:
 * - Swipe-right gesture to go back
 * - Touch-friendly action buttons
 * - Collapsible title on scroll
 * - Action sheet for overflow menu
 */

interface MobileHeaderProps {
    title?: string;
    onMenuClick?: () => void;
    onBackClick?: () => void;
    showBack?: boolean;
    showMenu?: boolean;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onShare?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    transparent?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    title = '',
    onMenuClick,
    onBackClick,
    showBack = false,
    showMenu = true,
    isFavorite = false,
    onToggleFavorite,
    onShare,
    onEdit,
    onDelete,
    transparent = false,
}) => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);

    // Detect scroll for header appearance change
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle back navigation
    const handleBack = useCallback(() => {
        if (onBackClick) {
            onBackClick();
        } else {
            navigate(-1);
        }
    }, [onBackClick, navigate]);

    // Swipe right gesture handler
    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (info.offset.x > 100 && info.velocity.x > 200) {
                handleBack();
            }
        },
        [handleBack]
    );

    const hasActions = onToggleFavorite || onShare || onEdit || onDelete;

    return (
        <>
            {/* Swipe gesture area - invisible but captures swipes from left edge */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="fixed top-0 left-0 w-6 h-20 z-50 touch-pan-y"
                style={{ touchAction: 'pan-y' }}
            />

            {/* Header bar */}
            <motion.header
                initial={false}
                animate={{
                    backgroundColor: transparent && !isScrolled
                        ? 'transparent'
                        : undefined,
                }}
                className={`
          fixed top-0 left-0 right-0 z-40 lg:hidden
          ${isScrolled || !transparent
                        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50'
                        : ''
                    }
        `}
            >
                {/* Safe area padding for iOS notch */}
                <div className="pt-safe">
                    <div className="flex items-center justify-between h-14 px-4">
                        {/* Left section */}
                        <div className="flex items-center gap-2 min-w-[60px]">
                            {showBack && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleBack}
                                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Go back"
                                >
                                    <ChevronLeft size={24} className="text-gray-700 dark:text-gray-300" />
                                </motion.button>
                            )}
                            {showMenu && !showBack && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onMenuClick}
                                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="Open menu"
                                >
                                    <Menu size={22} className="text-gray-700 dark:text-gray-300" />
                                </motion.button>
                            )}
                        </div>

                        {/* Title - centered with ellipsis for long text */}
                        <motion.h1
                            initial={false}
                            animate={{ opacity: isScrolled ? 1 : 0.8 }}
                            className="flex-1 text-center text-base font-semibold text-gray-900 dark:text-gray-100 truncate px-2"
                        >
                            {title}
                        </motion.h1>

                        {/* Right section - actions */}
                        <div className="flex items-center gap-1 min-w-[60px] justify-end">
                            {onToggleFavorite && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onToggleFavorite}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    {isFavorite ? (
                                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                    ) : (
                                        <StarOff size={20} className="text-gray-500" />
                                    )}
                                </motion.button>
                            )}
                            {hasActions && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowActionSheet(true)}
                                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label="More actions"
                                >
                                    <MoreVertical size={20} className="text-gray-700 dark:text-gray-300" />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Action Sheet */}
            <AnimatePresence>
                {showActionSheet && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowActionSheet(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                        />

                        {/* Action Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-t-2xl overflow-hidden pb-safe">
                                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto my-3" />

                                <div className="px-4 pb-4 space-y-1">
                                    {onShare && (
                                        <button
                                            onClick={() => {
                                                setShowActionSheet(false);
                                                onShare();
                                            }}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                        >
                                            <Share size={20} className="text-gray-600 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100 font-medium">Share</span>
                                        </button>
                                    )}

                                    {onEdit && (
                                        <button
                                            onClick={() => {
                                                setShowActionSheet(false);
                                                onEdit();
                                            }}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                        >
                                            <Edit3 size={20} className="text-gray-600 dark:text-gray-400" />
                                            <span className="text-gray-900 dark:text-gray-100 font-medium">Edit</span>
                                        </button>
                                    )}

                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                setShowActionSheet(false);
                                                onDelete();
                                            }}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={20} className="text-red-500" />
                                            <span className="text-red-600 dark:text-red-400 font-medium">Delete</span>
                                        </button>
                                    )}
                                </div>

                                <div className="px-4 pb-4">
                                    <button
                                        onClick={() => setShowActionSheet(false)}
                                        className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default MobileHeader;
