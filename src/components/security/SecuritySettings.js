import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { enable2FA, verify2FA, disable2FA, is2FAEnabled, getUserSecurity } from '../../lib/security/2fa';
import { logSecurityChange } from '../../lib/security/audit';
import { useToast } from '../../hooks/use-toast';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase/config';
// @ts-ignore - qrcode types may need to be installed separately
import QRCode from 'qrcode';
export const SecuritySettings = () => {
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [secret, setSecret] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [disableCode, setDisableCode] = useState('');
    const [securityAlerts, setSecurityAlerts] = useState([]);
    const [userSecurity, setUserSecurity] = useState(null);
    const { toast } = useToast();
    useEffect(() => {
        loadSecurityStatus();
        loadSecurityAlerts();
    }, []);
    const loadSecurityStatus = async () => {
        try {
            const enabled = await is2FAEnabled();
            setTwoFAEnabled(enabled);
            const security = await getUserSecurity();
            if (security) {
                setUserSecurity(security);
            }
        }
        catch (error) {
            console.error('Error loading security status:', error);
        }
    };
    const loadSecurityAlerts = async () => {
        const user = auth.currentUser;
        if (!user)
            return;
        try {
            const alertsQuery = query(collection(db, 'securityAlerts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10));
            const snapshot = await getDocs(alertsQuery);
            const alerts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSecurityAlerts(alerts);
        }
        catch (error) {
            console.error('Error loading security alerts:', error);
        }
    };
    const handleEnable2FA = async () => {
        setLoading(true);
        try {
            const result = await enable2FA();
            setSecret(result.secret);
            // Generate QR code
            const qrDataUrl = await QRCode.toDataURL(result.otpauthUrl);
            setQrCodeUrl(qrDataUrl);
            toast({
                title: '2FA Setup Started',
                description: 'Scan the QR code with your authenticator app and enter the verification code.',
            });
        }
        catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to enable 2FA',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerify2FA = async () => {
        if (!secret || !verificationCode) {
            toast({
                title: 'Error',
                description: 'Please enter the verification code',
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        try {
            const valid = await verify2FA(verificationCode, secret);
            if (valid) {
                setTwoFAEnabled(true);
                setQrCodeUrl(null);
                setSecret(null);
                setVerificationCode('');
                await logSecurityChange('2FA_ENABLE');
                toast({
                    title: 'Success',
                    description: '2FA has been enabled successfully!',
                });
                await loadSecurityStatus();
            }
            else {
                toast({
                    title: 'Invalid Code',
                    description: 'The verification code is incorrect. Please try again.',
                    variant: 'destructive',
                });
            }
        }
        catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to verify 2FA code',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleDisable2FA = async () => {
        if (!disableCode) {
            toast({
                title: 'Error',
                description: 'Please enter your 2FA code to disable',
                variant: 'destructive',
            });
            return;
        }
        setLoading(true);
        try {
            const success = await disable2FA(disableCode);
            if (success) {
                setTwoFAEnabled(false);
                setDisableCode('');
                await logSecurityChange('2FA_DISABLE');
                toast({
                    title: 'Success',
                    description: '2FA has been disabled successfully.',
                });
                await loadSecurityStatus();
            }
            else {
                toast({
                    title: 'Invalid Code',
                    description: 'The verification code is incorrect.',
                    variant: 'destructive',
                });
            }
        }
        catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to disable 2FA',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'HIGH':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'LOW':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    const formatDate = (timestamp) => {
        if (!timestamp)
            return 'Never';
        return new Date(timestamp.toMillis()).toLocaleString();
    };
    return (_jsxs("div", { className: "container mx-auto p-6 space-y-6 max-w-4xl", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Security Settings" }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Two-Factor Authentication (2FA)"] }), _jsx(CardDescription, { children: "Add an extra layer of security to your account with TOTP-based 2FA" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Status" }), _jsx("p", { className: "text-sm text-muted-foreground", children: twoFAEnabled ? (_jsxs("span", { className: "flex items-center gap-2 text-green-600 dark:text-green-400", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Enabled"] })) : (_jsxs("span", { className: "flex items-center gap-2 text-gray-600 dark:text-gray-400", children: [_jsx(XCircle, { className: "h-4 w-4" }), "Disabled"] })) })] }), !twoFAEnabled && !qrCodeUrl && (_jsx(Button, { onClick: handleEnable2FA, disabled: loading, children: "Enable 2FA" }))] }), qrCodeUrl && (_jsxs("div", { className: "space-y-4 p-4 border rounded-lg bg-muted/50", children: [_jsx("p", { className: "text-sm font-medium", children: "Scan this QR code with your authenticator app:" }), _jsx("div", { className: "flex justify-center", children: _jsx("img", { src: qrCodeUrl, alt: "2FA QR Code", className: "w-48 h-48" }) }), secret && (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Or enter this secret manually:" }), _jsx("code", { className: "block p-2 bg-background border rounded text-xs break-all", children: secret })] })), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Enter verification code:" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "text", placeholder: "000000", value: verificationCode, onChange: (e) => setVerificationCode(e.target.value), maxLength: 6, className: "max-w-[150px]" }), _jsx(Button, { onClick: handleVerify2FA, disabled: loading || verificationCode.length !== 6, children: "Verify" }), _jsx(Button, { variant: "outline", onClick: () => {
                                                            setQrCodeUrl(null);
                                                            setSecret(null);
                                                            setVerificationCode('');
                                                        }, children: "Cancel" })] })] })] })), twoFAEnabled && (_jsxs("div", { className: "space-y-2 p-4 border rounded-lg border-destructive/50", children: [_jsx("p", { className: "text-sm font-medium text-destructive", children: "Disable 2FA" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Enter your current 2FA code to disable two-factor authentication." }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "text", placeholder: "000000", value: disableCode, onChange: (e) => setDisableCode(e.target.value), maxLength: 6, className: "max-w-[150px]" }), _jsx(Button, { variant: "destructive", onClick: handleDisable2FA, disabled: loading || disableCode.length !== 6, children: "Disable 2FA" })] })] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), "Recent Security Alerts"] }), _jsx(CardDescription, { children: "Recent security events and alerts for your account" })] }), _jsx(CardContent, { children: securityAlerts.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No security alerts" })) : (_jsx("div", { className: "space-y-3", children: securityAlerts.map((alert) => (_jsx("div", { className: "flex items-start justify-between p-3 border rounded-lg", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`, children: alert.severity }), _jsx("span", { className: "text-sm font-medium", children: alert.type })] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["IP: ", alert.ip, " \u2022 ", formatDate(alert.timestamp)] }), alert.userAgent && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: alert.userAgent }))] }) }, alert.id))) })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), "Login & Security"] }), _jsx(CardDescription, { children: "Your recent login information" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Last Login" }), _jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4" }), formatDate(userSecurity?.lastLoginAt)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Last Login IP" }), _jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-2", children: [_jsx(Globe, { className: "h-4 w-4" }), userSecurity?.lastLoginIp || 'Unknown'] })] }), userSecurity?.trustedDevices && userSecurity.trustedDevices.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Trusted Devices" }), _jsx("div", { className: "space-y-2", children: userSecurity.trustedDevices.map((device, idx) => (_jsxs("div", { className: "text-sm text-muted-foreground p-2 border rounded", children: [device.label, " \u2022 Last seen: ", formatDate(device.lastSeen)] }, idx))) })] }))] })] })] }));
};
