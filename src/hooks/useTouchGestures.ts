import { useRef, useCallback, useState } from 'react';

/**
 * useTouchGestures - A hook for handling touch gestures
 * 
 * Supports:
 * - Swipe (left, right, up, down)
 * - Long press
 * - Pinch to zoom
 * - Double tap
 */

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface TouchGestureConfig {
    swipeThreshold?: number;
    longPressDelay?: number;
    doubleTapDelay?: number;
    onSwipe?: (direction: SwipeDirection, distance: number) => void;
    onLongPress?: () => void;
    onDoubleTap?: () => void;
    onPinch?: (scale: number) => void;
}

interface TouchGestureHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchCancel: () => void;
}

interface TouchGestureState {
    isSwiping: boolean;
    isLongPressing: boolean;
    swipeDirection: SwipeDirection | null;
    swipeDistance: number;
}

export function useTouchGestures(config: TouchGestureConfig): [TouchGestureHandlers, TouchGestureState] {
    const {
        swipeThreshold = 50,
        longPressDelay = 500,
        doubleTapDelay = 300,
        onSwipe,
        onLongPress,
        onDoubleTap,
        onPinch,
    } = config;

    // Touch tracking refs
    const startPos = useRef({ x: 0, y: 0 });
    const startTime = useRef(0);
    const lastTapTime = useRef(0);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const initialPinchDistance = useRef(0);

    // State
    const [state, setState] = useState<TouchGestureState>({
        isSwiping: false,
        isLongPressing: false,
        swipeDirection: null,
        swipeDistance: 0,
    });

    // Calculate distance between two touch points for pinch
    const getTouchDistance = (touches: React.TouchList): number => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Handle touch start
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Handle pinch gesture setup
        if (e.touches.length === 2 && onPinch) {
            initialPinchDistance.current = getTouchDistance(e.touches);
            return;
        }

        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        startPos.current = { x: touch.clientX, y: touch.clientY };
        startTime.current = Date.now();

        // Check for double tap
        if (onDoubleTap) {
            const timeSinceLastTap = startTime.current - lastTapTime.current;
            if (timeSinceLastTap < doubleTapDelay && timeSinceLastTap > 0) {
                onDoubleTap();
                lastTapTime.current = 0;
                return;
            }
        }

        // Set up long press detection
        if (onLongPress) {
            longPressTimer.current = setTimeout(() => {
                setState(prev => ({ ...prev, isLongPressing: true }));
                onLongPress();
                // Haptic feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate([20]);
                }
            }, longPressDelay);
        }
    }, [onLongPress, onDoubleTap, longPressDelay, doubleTapDelay, onPinch]);

    // Handle touch move
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        // Handle pinch gesture
        if (e.touches.length === 2 && onPinch && initialPinchDistance.current > 0) {
            const currentDistance = getTouchDistance(e.touches);
            const scale = currentDistance / initialPinchDistance.current;
            onPinch(scale);
            return;
        }

        if (e.touches.length !== 1) return;

        // Cancel long press if moved too much
        if (longPressTimer.current) {
            const touch = e.touches[0];
            const dx = touch.clientX - startPos.current.x;
            const dy = touch.clientY - startPos.current.y;

            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
        }

        // Track swipe
        const touch = e.touches[0];
        const dx = touch.clientX - startPos.current.x;
        const dy = touch.clientY - startPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
            let direction: SwipeDirection;
            if (Math.abs(dx) > Math.abs(dy)) {
                direction = dx > 0 ? 'right' : 'left';
            } else {
                direction = dy > 0 ? 'down' : 'up';
            }

            setState({
                isSwiping: true,
                isLongPressing: false,
                swipeDirection: direction,
                swipeDistance: distance,
            });
        }
    }, [onPinch]);

    // Handle touch end
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        // Clear long press timer
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        // Reset pinch
        initialPinchDistance.current = 0;

        // Record tap time for double tap detection
        if (!state.isSwiping && !state.isLongPressing) {
            lastTapTime.current = Date.now();
        }

        // Handle swipe completion
        if (state.isSwiping && state.swipeDirection && state.swipeDistance >= swipeThreshold) {
            if (onSwipe) {
                onSwipe(state.swipeDirection, state.swipeDistance);
            }
        }

        // Reset state
        setState({
            isSwiping: false,
            isLongPressing: false,
            swipeDirection: null,
            swipeDistance: 0,
        });
    }, [state, swipeThreshold, onSwipe]);

    // Handle touch cancel
    const handleTouchCancel = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        initialPinchDistance.current = 0;

        setState({
            isSwiping: false,
            isLongPressing: false,
            swipeDirection: null,
            swipeDistance: 0,
        });
    }, []);

    const handlers: TouchGestureHandlers = {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchCancel,
    };

    return [handlers, state];
}

/**
 * useSwipe - Simplified hook for just swipe detection
 */
export function useSwipe(
    onSwipe: (direction: SwipeDirection) => void,
    threshold = 50
) {
    const [handlers] = useTouchGestures({
        swipeThreshold: threshold,
        onSwipe: (direction) => onSwipe(direction),
    });

    return handlers;
}

/**
 * useLongPress - Simplified hook for just long press detection
 */
export function useLongPress(
    onLongPress: () => void,
    delay = 500
) {
    const [handlers] = useTouchGestures({
        longPressDelay: delay,
        onLongPress,
    });

    return handlers;
}

export default useTouchGestures;
