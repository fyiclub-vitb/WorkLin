import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

/**
 * SwipeableCard - A card component with swipe actions
 * 
 * Supports:
 * - Swipe left to reveal delete/secondary action
 * - Swipe right to reveal primary action (e.g., complete, favorite)
 * - Tactile feedback via haptics (when available)
 * - Smooth spring animations
 */

interface SwipeAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    action: () => void;
}

interface SwipeableCardProps {
    children: React.ReactNode;
    leftActions?: SwipeAction[];
    rightActions?: SwipeAction[];
    onTap?: () => void;
    disabled?: boolean;
    className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
    children,
    leftActions = [],
    rightActions = [],
    onTap,
    disabled = false,
    className = '',
}) => {
    const [dragX, setDragX] = useState(0);
    const [isRevealed, setIsRevealed] = useState<'left' | 'right' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const actionWidth = 80;
    const threshold = 50;

    // Reset revealed state when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsRevealed(null);
            }
        };

        if (isRevealed) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isRevealed]);

    // Haptic feedback helper
    const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30, 10, 30],
            };
            navigator.vibrate(patterns[style]);
        }
    }, []);

    // Handle drag
    const handleDrag = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (disabled) return;

            const newX = info.offset.x;

            // Provide haptic feedback when crossing threshold
            if (Math.abs(newX) > threshold && Math.abs(dragX) <= threshold) {
                triggerHaptic('light');
            }

            setDragX(newX);
        },
        [disabled, dragX, threshold, triggerHaptic]
    );

    // Handle drag end
    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (disabled) return;

            const offsetX = info.offset.x;
            const velocityX = info.velocity.x;

            // Check if swipe is fast enough or far enough to reveal actions
            const shouldRevealLeft = (offsetX > threshold || velocityX > 500) && rightActions.length > 0;
            const shouldRevealRight = (offsetX < -threshold || velocityX < -500) && leftActions.length > 0;

            if (shouldRevealLeft) {
                setIsRevealed('left');
                triggerHaptic('medium');
            } else if (shouldRevealRight) {
                setIsRevealed('right');
                triggerHaptic('medium');
            } else {
                setIsRevealed(null);
            }

            setDragX(0);
        },
        [disabled, threshold, leftActions.length, rightActions.length, triggerHaptic]
    );

    // Calculate reveal offset
    const revealOffset = isRevealed === 'left'
        ? actionWidth * rightActions.length
        : isRevealed === 'right'
            ? -actionWidth * leftActions.length
            : 0;

    // Execute action and close
    const executeAction = useCallback((action: SwipeAction) => {
        triggerHaptic('heavy');
        action.action();
        setIsRevealed(null);
    }, [triggerHaptic]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden ${className}`}
        >
            {/* Left actions (revealed by swiping right) */}
            {rightActions.length > 0 && (
                <div className="absolute left-0 top-0 bottom-0 flex">
                    {rightActions.map((action, index) => (
                        <motion.button
                            key={action.id}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: isRevealed === 'left' || dragX > 0 ? 1 : 0,
                                scale: isRevealed === 'left' ? 1 : 0.9,
                            }}
                            onClick={() => executeAction(action)}
                            className={`
                flex items-center justify-center
                w-20 h-full ${action.bgColor}
                transition-transform duration-200
              `}
                            style={{ zIndex: rightActions.length - index }}
                        >
                            <div className={`flex flex-col items-center gap-1 ${action.color}`}>
                                {action.icon}
                                <span className="text-xs font-medium">{action.label}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Right actions (revealed by swiping left) */}
            {leftActions.length > 0 && (
                <div className="absolute right-0 top-0 bottom-0 flex">
                    {leftActions.map((action, index) => (
                        <motion.button
                            key={action.id}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: isRevealed === 'right' || dragX < 0 ? 1 : 0,
                                scale: isRevealed === 'right' ? 1 : 0.9,
                            }}
                            onClick={() => executeAction(action)}
                            className={`
                flex items-center justify-center
                w-20 h-full ${action.bgColor}
                transition-transform duration-200
              `}
                            style={{ zIndex: leftActions.length - index }}
                        >
                            <div className={`flex flex-col items-center gap-1 ${action.color}`}>
                                {action.icon}
                                <span className="text-xs font-medium">{action.label}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Main content */}
            <motion.div
                drag={disabled ? false : 'x'}
                dragConstraints={{
                    left: leftActions.length > 0 ? -actionWidth * leftActions.length : 0,
                    right: rightActions.length > 0 ? actionWidth * rightActions.length : 0
                }}
                dragElastic={0.1}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ x: revealOffset }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={isRevealed ? () => setIsRevealed(null) : onTap}
                className="relative bg-white dark:bg-gray-800 touch-pan-y"
                style={{ touchAction: 'pan-y' }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SwipeableCard;
