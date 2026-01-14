import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, LogIn, Lock, Mail } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    // Demo credentials
    const DEMO_EMAIL = 'demo@worklin.com';
    const DEMO_PASSWORD = 'demo123';
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Check demo credentials
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            // Store demo session
            localStorage.setItem('worklin-demo-user', JSON.stringify({
                email: DEMO_EMAIL,
                name: 'Demo User',
                isDemo: true,
            }));
            toast({
                title: 'Welcome to WorkLin!',
                description: 'You are logged in as a demo user.',
            });
            navigate('/app');
        }
        else {
            toast({
                title: 'Invalid credentials',
                description: 'Please use the demo credentials: demo@worklin.com / demo123',
                variant: 'destructive',
            });
        }
        setLoading(false);
    };
    const handleDemoLogin = () => {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        // Auto-submit after setting values
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                form.requestSubmit();
            }
        }, 100);
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors", children: [_jsx(ArrowLeft, { size: 18 }), _jsx("span", { children: "Back to home" })] }), _jsxs(Card, { className: "shadow-xl border-0", children: [_jsxs(CardHeader, { className: "text-center space-y-2", children: [_jsx("div", { className: "w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2", children: "W" }), _jsx(CardTitle, { className: "text-3xl font-bold", children: "Welcome to WorkLin" }), _jsx(CardDescription, { className: "text-base", children: "Sign in to your workspace or try the demo" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { htmlFor: "email", className: "text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2", children: [_jsx(Mail, { size: 16 }), "Email"] }), _jsx(Input, { id: "email", type: "email", placeholder: "demo@worklin.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "h-11" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { htmlFor: "password", className: "text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2", children: [_jsx(Lock, { size: 16 }), "Password"] }), _jsx(Input, { id: "password", type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "h-11" })] }), _jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: [_jsx("p", { className: "text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2", children: "\uD83C\uDFAF Demo Credentials" }), _jsx("p", { className: "text-xs text-blue-700 dark:text-blue-300 mb-3", children: "Use these credentials to try WorkLin:" }), _jsxs("div", { className: "space-y-1 text-xs font-mono text-blue-800 dark:text-blue-200", children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " demo@worklin.com"] }), _jsxs("p", { children: [_jsx("strong", { children: "Password:" }), " demo123"] })] }), _jsx(Button, { type: "button", onClick: handleDemoLogin, variant: "outline", className: "w-full mt-3 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30", children: "Use Demo Credentials" })] }), _jsx(Button, { type: "submit", disabled: loading, className: "w-full h-11 bg-blue-600 hover:bg-blue-700 text-white", children: loading ? ('Signing in...') : (_jsxs(_Fragment, { children: [_jsx(LogIn, { size: 18, className: "mr-2" }), "Sign In"] })) }), _jsx("div", { className: "text-center text-sm text-gray-500 dark:text-gray-400", children: _jsxs("p", { children: ["Don't have an account?", ' ', _jsx("button", { type: "button", onClick: handleDemoLogin, className: "text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer", children: "Demo mode available" })] }) })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700", children: _jsxs("p", { className: "text-xs text-center text-gray-500 dark:text-gray-400", children: ["\uD83D\uDD12 Full authentication with Firebase coming soon", _jsx("br", {}), _jsxs("span", { className: "text-blue-600 dark:text-blue-400", children: ["See ", _jsx(Link, { to: "/", className: "underline", children: "GITHUB_ISSUES.md" }), " for contribution opportunities"] })] }) })] })] })] }) }));
};
