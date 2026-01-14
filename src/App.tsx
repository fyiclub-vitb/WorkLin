import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Workspace } from './pages/Workspace';
import { SecuritySettings } from './components/security/SecuritySettings';
import { AuditLog } from './components/security/AuditLog';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Workspace />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
