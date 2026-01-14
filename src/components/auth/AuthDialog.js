import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '../../lib/firebase/auth';
import { useToast } from '../../hooks/use-toast';
export const AuthDialog = ({ open, onOpenChange, mode: initialMode = 'login', }) => {
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const handleEmailAuth = async () => {
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { user, error } = await signUpWithEmail(email, password, displayName);
                if (error) {
                    toast({
                        title: 'Error',
                        description: error,
                        variant: 'destructive',
                    });
                }
                else {
                    toast({
                        title: 'Success',
                        description: 'Account created successfully!',
                    });
                    onOpenChange(false);
                }
            }
            else {
                const { user, error } = await loginWithEmail(email, password);
                if (error) {
                    toast({
                        title: 'Error',
                        description: error,
                        variant: 'destructive',
                    });
                }
                else {
                    toast({
                        title: 'Success',
                        description: 'Logged in successfully!',
                    });
                    onOpenChange(false);
                }
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const { user, error } = await loginWithGoogle();
            if (error) {
                toast({
                    title: 'Error',
                    description: error,
                    variant: 'destructive',
                });
            }
            else {
                toast({
                    title: 'Success',
                    description: 'Logged in successfully!',
                });
                onOpenChange(false);
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: mode === 'login' ? 'Login' : 'Sign Up' }), _jsx(DialogDescription, { children: mode === 'login'
                                ? 'Enter your credentials to access WorkLin'
                                : 'Create a new account to get started' })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [mode === 'signup' && (_jsxs("div", { className: "grid gap-2", children: [_jsx("label", { htmlFor: "displayName", className: "text-sm font-medium", children: "Display Name" }), _jsx(Input, { id: "displayName", placeholder: "John Doe", value: displayName, onChange: (e) => setDisplayName(e.target.value) })] })), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { htmlFor: "email", className: "text-sm font-medium", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("label", { htmlFor: "password", className: "text-sm font-medium", children: "Password" }), _jsx(Input, { id: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value) })] })] }), _jsxs(DialogFooter, { className: "flex flex-col gap-2", children: [_jsx(Button, { onClick: handleEmailAuth, disabled: loading || !email || !password, className: "w-full", children: mode === 'login' ? 'Login' : 'Sign Up' }), _jsx(Button, { onClick: handleGoogleAuth, disabled: loading, variant: "outline", className: "w-full", children: "Continue with Google" }), _jsx("button", { onClick: () => setMode(mode === 'login' ? 'signup' : 'login'), className: "text-sm text-muted-foreground hover:text-foreground", children: mode === 'login'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Login' })] })] }) }));
};
