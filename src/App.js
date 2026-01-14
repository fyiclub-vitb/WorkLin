import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Workspace } from './pages/Workspace';
import { SecuritySettings } from './components/security/SecuritySettings';
import { AuditLog } from './components/security/AuditLog';
import { Toaster } from './components/ui/toaster';
function App() {
    return (_jsxs(BrowserRouter, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/app", element: _jsx(Workspace, {}) }), _jsx(Route, { path: "/app/search", element: _jsx(Workspace, {}) }), _jsx(Route, { path: "/security", element: _jsx(SecuritySettings, {}) }), _jsx(Route, { path: "/audit-log", element: _jsx(AuditLog, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }), _jsx(Toaster, {})] }));
}
export default App;
