import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * OfflineIndicator Component
 * 
 * Shows a small badge in the bottom-right corner of the screen indicating network status.
 * This is useful because the app has offline support via service workers,
 * and users need to know if they're working offline or online.
 * 
 * How it works:
 * 1. Listens to browser's online/offline events
 * 2. Updates UI when network status changes
 * 3. Shows green "Online" badge when connected
 * 4. Shows orange "Offline Mode" badge when disconnected
 * 
 * The indicator appears with smooth animations and stays fixed in the corner
 * even when scrolling.
 */
export const OfflineIndicator: React.FC = () => {
    // Track online/offline status in state
    // navigator.onLine is a browser API that tells us if we have internet
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Event handler for when we go online
        const handleOnline = () => setIsOnline(true);
        
        // Event handler for when we go offline
        const handleOffline = () => setIsOnline(false);

        // Set up listeners for network status changes
        // These are browser events that fire when network connectivity changes
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup function runs when component unmounts
        // Removes event listeners to prevent memory leaks
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Empty dependency array means this only runs once on mount

    // If online, show the green online indicator
    if (isOnline) {
        return (
            <div className="fixed bottom-4 right-4 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Wifi size={14} /> {/* WiFi icon */}
                Online
            </div>
        );
    }

    // If offline, show the orange offline indicator
    // animate-pulse makes it pulse to draw attention
    return (
        <div className="fixed bottom-4 right-4 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-orange-500/20 animate-pulse">
            <WifiOff size={14} /> {/* WiFi off icon */}
            Offline Mode
        </div>
    );
};