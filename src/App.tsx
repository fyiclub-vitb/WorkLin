import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Workspace } from './pages/Workspace';
import { Settings } from './pages/Settings';
import { SecuritySettings } from './components/security/SecuritySettings';
import { AuditLog } from './components/security/AuditLog';
import { Toaster } from './components/ui/toaster';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { PageHeader } from './components/PageHeader';
import { OfflineIndicator } from './components/ui/offline-indicator';

// App-level routing.
//
// `Workspace` is used as a container for multiple in-app routes (search/analytics)
// so we keep a single shared layout and switch internal views based on location.
function App() {
  const { isOpen, setIsOpen } = useKeyboardShortcuts();

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
      <OfflineIndicator />
    </BrowserRouter>
  );
}

export default App;