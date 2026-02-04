import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Loader2 } from 'lucide-react';

/**
 * PullToRefresh - A mobile-optimized pull-to-refresh component
 * 
 * Features:
 * - Native-like pull-to-refresh gesture
 * - Visual feedback with spinner
 * - Haptic feedback (when available)
 * - Works with scroll containers
 */

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    pullThreshold?: number;
    refreshIndicatorHeight?: number;
    disabled?: boolean;
    className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    children,
    onRefresh,
    pullThreshold = 80,
    refreshIndicatorHeight = 60,
    disabled = false,
    className = '',
}) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const scrollTop = useRef(0);

    // Calculate progress (0 to 1)
    const progress = Math.min(pullDistance / pullThreshold, 1);

    // Haptic feedback
    const triggerHaptic = useCallback(() => {
        if ('vibrate' in navigator) {
            navigator.vibrate([15]);
        }
    }, []);

    // Handle touch start
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || isRefreshing) return;

        touchStartY.current = e.touches[0].clientY;
        scrollTop.current = containerRef.current?.scrollTop ?? 0;

        if (scrollTop.current === 0) {
            setIsPulling(true);
        }
    }, [disabled, isRefreshing]);

    // Handle touch move
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || disabled || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;

        if (diff > 0 && scrollTop.current === 0) {
            // Apply resistance to make it feel natural
            const resistance = 0.4;
            const newDistance = diff * resistance;

            // Trigger haptic when crossing threshold
            if (pullDistance < pullThreshold && newDistance >= pullThreshold) {
                triggerHaptic();
            }

            setPullDistance(Math.min(newDistance, pullThreshold * 1.5));

            // Prevent default scroll
            if (diff > 10) {
                e.preventDefault();
            }
        }
    }, [isPulling, disabled, isRefreshing, pullDistance, pullThreshold, triggerHaptic]);

    // Handle touch end
    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        setIsPulling(false);

        if (pullDistance >= pullThreshold) {
            setIsRefreshing(true);
            triggerHaptic();

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setPullDistance(0);
    }, [isPulling, pullDistance, pullThreshold, onRefresh, triggerHaptic]);

    // Handle touch cancel
    const handleTouchCancel = useCallback(() => {
        setIsPulling(false);
        setPullDistance(0);
    }, []);

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            className={`relative overflow-auto ${className}`}
            style={{ touchAction: isPulling ? 'none' : 'pan-y' }}
        >
            {/* Refresh indicator */}
            <AnimatePresence>
                {(pullDistance > 0 || isRefreshing) && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{
                            height: isRefreshing ? refreshIndicatorHeight : pullDistance,
                        }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden"
                    >
                        <motion.div
                            animate={{
                                rotate: isRefreshing ? 360 : progress * 180,
                                scale: isRefreshing ? 1 : 0.8 + progress * 0.2,
                            }}
                            transition={isRefreshing ? {
                                rotate: { repeat: Infinity, duration: 1, ease: 'linear' }
                            } : {}}
                            className={`
                p-2 rounded-full
                ${progress >= 1 || isRefreshing
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }
              `}
                        >
                            {isRefreshing ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <RefreshCw size={20} />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pull hint text */}
            <AnimatePresence>
                {pullDistance > 20 && !isRefreshing && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: progress }}
                        exit={{ opacity: 0 }}
                        className="absolute top-2 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400"
                    >
                        {progress >= 1 ? 'Release to refresh' : 'Pull down to refresh'}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Content */}
            <motion.div
                animate={{
                    y: isPulling ? pullDistance * 0.3 : 0,
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PullToRefresh;
