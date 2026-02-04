import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Search,
    Plus,
    Settings,
    FileText,
    BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MobileBottomNav - A bottom navigation bar optimized for mobile devices
 * 
 * This provides quick access to the main sections of the app with large,
 * touch-friendly buttons. It follows mobile UI best practices with:
 * - 48px minimum touch targets
 * - Visual feedback on tap
 * - Active state indication
 * - Smooth animations
 */

interface NavItem {
    id: string;
    icon: React.ElementType;
    label: string;
    path: string;
    action?: () => void;
}

interface MobileBottomNavProps {
    onNewPage?: () => void;
    currentPageId?: string | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    onNewPage,
    currentPageId,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide nav on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navItems: NavItem[] = [
        {
            id: 'home',
            icon: Home,
            label: 'Home',
            path: '/app',
        },
        {
            id: 'search',
            icon: Search,
            label: 'Search',
            path: '/app/search',
        },
        {
            id: 'new',
            icon: Plus,
            label: 'New',
            path: '',
            action: onNewPage,
        },
        {
            id: 'analytics',
            icon: BarChart2,
            label: 'Analytics',
            path: '/app/analytics',
        },
        {
            id: 'settings',
            icon: Settings,
            label: 'Settings',
            path: '/app/settings',
        },
    ];

    const getActiveItem = () => {
        if (location.pathname === '/app/search') return 'search';
        if (location.pathname === '/app/analytics') return 'analytics';
        if (location.pathname === '/app/settings') return 'settings';
        return 'home';
    };

    const activeItem = getActiveItem();

    const handleNavClick = (item: NavItem) => {
        if (item.action) {
            item.action();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                    role="navigation"
                    aria-label="Main navigation"
                >
                    {/* Glass effect background */}
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50" />

                    {/* Safe area padding for iOS devices */}
                    <div className="relative pb-safe">
                        <ul className="flex items-center justify-around px-2 py-2">
                            {navItems.map((item) => (
                                <li key={item.id}>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleNavClick(item)}
                                        className={`
                      flex flex-col items-center justify-center 
                      min-w-[60px] min-h-[48px] px-3 py-2 
                      rounded-xl transition-colors duration-200
                      ${item.id === 'new'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : activeItem === item.id
                                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }
                    `}
                                        aria-label={item.label}
                                        aria-current={activeItem === item.id ? 'page' : undefined}
                                    >
                                        <item.icon
                                            size={item.id === 'new' ? 22 : 20}
                                            strokeWidth={item.id === 'new' ? 2.5 : 2}
                                        />
                                        <span className={`
                      text-[10px] mt-1 font-medium
                      ${item.id === 'new' ? 'hidden' : ''}
                    `}>
                                            {item.label}
                                        </span>
                                    </motion.button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default MobileBottomNav;
