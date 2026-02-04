import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Workspace } from './pages/Workspace';
import { Settings } from './pages/Settings';
import { SecuritySettings } from './components/security/SecuritySettings';
import { AuditLog } from './components/security/AuditLog';
import { Toaster } from './components/ui/toaster';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CommandPalette } from './components/CommandPalette';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { useCommandPalette } from './hooks/useCommandPalette';

import { PageHeader } from './components/PageHeader';
import { OfflineIndicator } from './components/ui/offline-indicator';

// Mobile PWA components
import { InstallPrompt, UpdatePrompt } from './components/mobile';
import { useIsMobile } from './hooks/useMobileDetect';

// App-level routing.
//
// `Workspace` is used as a container for multiple in-app routes (search/analytics)
// so we keep a single shared layout and switch internal views based on location.
function App() {
  const { isOpen, setIsOpen } = useKeyboardShortcuts();
  const { isOpen: isPaletteOpen, setIsOpen: setIsPaletteOpen, commands } = useCommandPalette();
  const isMobile = useIsMobile();

  // Service worker registration for update prompts
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | undefined>();

  // Listen for service worker updates - getting them from global window object
  useEffect(() => {
    // Check if registration exists on window
    if (window.swRegistration) {
      setSwRegistration(window.swRegistration);
    }

    // Listen for custom sw update event from main.tsx
    const handleSwUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ registration: ServiceWorkerRegistration }>;
      setSwRegistration(customEvent.detail.registration);
    };

    window.addEventListener('swUpdate', handleSwUpdate);

    return () => {
      window.removeEventListener('swUpdate', handleSwUpdate);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/app" element={<Workspace />} />
        <Route path="/app/search" element={<Workspace />} />
        <Route path="/app/analytics" element={<Workspace />} />
        <Route path="/app/webhooks" element={<Workspace />} />
        <Route path="/app/settings" element={<Settings />} />

        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />

      <ShortcutsModal open={isOpen} onOpenChange={setIsOpen} />
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        commands={commands}
      />
      <OfflineIndicator />

      {/* Mobile PWA features */}
      {isMobile && <InstallPrompt delay={60000} />}
      <UpdatePrompt registration={swRegistration} />
    </BrowserRouter>
  );
}

export default App;