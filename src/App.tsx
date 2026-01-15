import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Workspace } from './pages/Workspace';
import { SecuritySettings } from './components/security/SecuritySettings';
import { AuditLog } from './components/security/AuditLog';
import { Toaster } from './components/ui/toaster';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

import { PageHeader } from './components/PageHeader'; // Adjust path if needed


function App() {
  const { isOpen, setIsOpen } = useKeyboardShortcuts();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Workspace />} />
        <Route path="/app/search" element={<Workspace />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      
      {/* 3. Render the Modal globally */}
      <ShortcutsModal open={isOpen} onOpenChange={setIsOpen} />
    </BrowserRouter>
  );
}

export default App;