import React, { useEffect, useState } from 'react';
import { useCollaboration } from './CollaborationProvider';
import { PresenceEntry, subscribeToPresence } from '../../lib/firebase/presence';

export const PresenceIndicator: React.FC = () => {
    const { provider } = useCollaboration();
    const [users, setUsers] = useState<PresenceEntry[]>([]);

    useEffect(() => {
        if (!provider?.awareness) return;

        // Subscribe to presence changes
        const unsubscribe = subscribeToPresence(provider.awareness, (updatedUsers) => {
            setUsers(updatedUsers);
        });

        return () => {
            unsubscribe();
        };
    }, [provider]);

    if (users.length === 0) return null;

    return (
        <div className="flex items-center -space-x-2 mr-2">
            {users.slice(0, 3).map((user) => (
                <div
                    key={user.clientId}
                    className="relative group cursor-default"
                >
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-[#1e1e1e] overflow-hidden bg-gray-200 dark:bg-gray-700 transition-transform hover:z-10 hover:scale-110"
                        style={{ backgroundColor: user.photoURL ? undefined : user.color }}
                        title={user.displayName}
                    >
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-semibold text-white">
                                {getInitials(user.displayName)}
                            </span>
                        )}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                        {user.displayName}
                    </div>
                </div>
            ))}

            {users.length > 3 && (
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#1e1e1e] text-xs font-medium z-0 text-gray-600 dark:text-gray-300"
                    title={`${users.length - 3} more`}
                >
                    +{users.length - 3}
                </div>
            )}
        </div>
    );
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}