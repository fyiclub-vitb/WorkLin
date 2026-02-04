import { useState, useEffect, useCallback } from 'react';

/**
 * useMobileDetect - A hook to detect mobile device characteristics
 * 
 * Detects:
 * - Mobile vs Desktop
 * - iOS vs Android
 * - Tablet vs Phone
 * - PWA vs Browser
 * - Touch capabilities
 */

interface MobileInfo {
    isMobile: boolean;
    isTablet: boolean;
    isPhone: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isPWA: boolean;
    hasTouch: boolean;
    isLandscape: boolean;
    screenWidth: number;
    screenHeight: number;
    safeAreaInsets: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export function useMobileDetect(): MobileInfo {
    const [mobileInfo, setMobileInfo] = useState<MobileInfo>(() => getInitialMobileInfo());

    useEffect(() => {
        const updateInfo = () => {
            setMobileInfo(getInitialMobileInfo());
        };

        // Update on resize and orientation change
        window.addEventListener('resize', updateInfo);
        window.addEventListener('orientationchange', updateInfo);

        // Also listen for media query changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        mediaQuery.addEventListener('change', updateInfo);

        return () => {
            window.removeEventListener('resize', updateInfo);
            window.removeEventListener('orientationchange', updateInfo);
            mediaQuery.removeEventListener('change', updateInfo);
        };
    }, []);

    return mobileInfo;
}

function getInitialMobileInfo(): MobileInfo {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // Device detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /webOS|BlackBerry|Opera Mini|IEMobile/i.test(userAgent);

    // Screen size detection
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    // Tablet detection (rough heuristic based on screen size)
    const isTablet = isMobile && Math.min(screenWidth, screenHeight) >= 600;
    const isPhone = isMobile && !isTablet;

    // PWA detection
    const isPWA = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );

    // Touch detection
    const hasTouch = typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
    );

    // Orientation detection
    const isLandscape = screenWidth > screenHeight;

    // Safe area insets (for notched devices)
    const safeAreaInsets = getSafeAreaInsets();

    return {
        isMobile,
        isTablet,
        isPhone,
        isIOS,
        isAndroid,
        isPWA,
        hasTouch,
        isLandscape,
        screenWidth,
        screenHeight,
        safeAreaInsets,
    };
}

function getSafeAreaInsets() {
    if (typeof window === 'undefined' || !CSS.supports('padding-top: env(safe-area-inset-top)')) {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    // Create a temporary element to measure safe area insets
    const testElement = document.createElement('div');
    testElement.style.cssText = `
    position: fixed;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    visibility: hidden;
    pointer-events: none;
  `;
    document.body.appendChild(testElement);

    const computedStyle = getComputedStyle(testElement);
    const insets = {
        top: parseFloat(computedStyle.paddingTop) || 0,
        bottom: parseFloat(computedStyle.paddingBottom) || 0,
        left: parseFloat(computedStyle.paddingLeft) || 0,
        right: parseFloat(computedStyle.paddingRight) || 0,
    };

    document.body.removeChild(testElement);

    return insets;
}

/**
 * useIsMobile - Simple hook to check if device is mobile
 */
export function useIsMobile(): boolean {
    const { isMobile } = useMobileDetect();
    return isMobile;
}

/**
 * useOrientation - Hook to detect device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() =>
        typeof window !== 'undefined'
            ? window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            : 'portrait'
    );

    useEffect(() => {
        const updateOrientation = () => {
            setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
        };

        window.addEventListener('resize', updateOrientation);
        window.addEventListener('orientationchange', updateOrientation);

        return () => {
            window.removeEventListener('resize', updateOrientation);
            window.removeEventListener('orientationchange', updateOrientation);
        };
    }, []);

    return orientation;
}

export default useMobileDetect;
