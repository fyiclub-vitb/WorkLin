import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) {
        return (
            <div className="fixed bottom-4 right-4 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Wifi size={14} />
                Online
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-orange-500/20 animate-pulse">
            <WifiOff size={14} />
            Offline Mode
        </div>
    );
};
