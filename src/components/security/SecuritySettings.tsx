import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { enable2FA, verify2FA, disable2FA, is2FAEnabled, getUserSecurity } from '../../lib/security/2fa';
import { logSecurityChange } from '../../lib/security/audit';
import { useToast } from '../../hooks/use-toast';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Globe } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase/config';
// @ts-ignore - qrcode types may need to be installed separately
import QRCode from 'qrcode';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  ip: string;
  userAgent?: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
  resolved: boolean;
}

interface UserSecurity {
  twoFAEnabled: boolean;
  lastLoginAt?: Timestamp;
  lastLoginIp?: string;
  trustedDevices?: Array<{ deviceId: string; label: string; lastSeen: Timestamp }>;
  suspiciousFlags?: Array<{ type: string; timestamp: Timestamp; details?: any }>;
}

// This component manages security settings like 2FA and shows security alerts
export const SecuritySettings: React.FC = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [userSecurity, setUserSecurity] = useState<UserSecurity | null>(null);
  const { toast } = useToast();

  // Load security status and alerts when component mounts
  useEffect(() => {
    loadSecurityStatus();
    loadSecurityAlerts();
  }, []);

  // Check if 2FA is enabled and load user security info
  const loadSecurityStatus = async () => {
    try {
      const enabled = await is2FAEnabled();
      setTwoFAEnabled(enabled);
      const security = await getUserSecurity();
      if (security) {
        setUserSecurity(security as UserSecurity);
      }
    } catch (error: any) {
      console.error('Error loading security status:', error);
    }
  };

  // Load recent security alerts for this user
  const loadSecurityAlerts = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const alertsQuery = query(
        collection(db, 'securityAlerts'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10) // Only show last 10 alerts
      );
      const snapshot = await getDocs(alertsQuery);
      const alerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SecurityAlert[];
      setSecurityAlerts(alerts);
    } catch (error: any) {
      console.error('Error loading security alerts:', error);
    }
  };

  // Start the 2FA setup process
  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      // Generate a secret and QR code for the authenticator app
      const result = await enable2FA();
      setSecret(result.secret);
      
      // Convert the auth URL to a QR code image
      const qrDataUrl = await QRCode.toDataURL(result.otpauthUrl);
      setQrCodeUrl(qrDataUrl);
      
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app and enter the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enable 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify the code from the authenticator app to complete 2FA setup
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
        // Success! 2FA is now enabled
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
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify 2FA code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA (requires entering current 2FA code for security)
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
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Color code alerts by severity
  const getSeverityColor = (severity: string) => {
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

  // Format timestamp to readable date
  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp.toMillis()).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Security Settings</h1>

      {/* 2FA Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with TOTP-based 2FA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {twoFAEnabled ? (
                  <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <XCircle className="h-4 w-4" />
                    Disabled
                  </span>
                )}
              </p>
            </div>
            {!twoFAEnabled && !qrCodeUrl && (
              <Button onClick={handleEnable2FA} disabled={loading}>
                Enable 2FA
              </Button>
            )}
          </div>

          {/* QR Code Setup Flow */}
          {qrCodeUrl && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              {secret && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Or enter this secret manually:</p>
                  <code className="block p-2 bg-background border rounded text-xs break-all">
                    {secret}
                  </code>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter verification code:</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="max-w-[150px]"
                  />
                  <Button onClick={handleVerify2FA} disabled={loading || verificationCode.length !== 6}>
                    Verify
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQrCodeUrl(null);
                      setSecret(null);
                      setVerificationCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Disable 2FA Section */}
          {twoFAEnabled && (
            <div className="space-y-2 p-4 border rounded-lg border-destructive/50">
              <p className="text-sm font-medium text-destructive">Disable 2FA</p>
              <p className="text-xs text-muted-foreground">
                Enter your current 2FA code to disable two-factor authentication.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  maxLength={6}
                  className="max-w-[150px]"
                />
                <Button
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={loading || disableCode.length !== 6}
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Security Alerts
          </CardTitle>
          <CardDescription>Recent security events and alerts for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {securityAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security alerts</p>
          ) : (
            <div className="space-y-3">
              {securityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Severity badge */}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-sm font-medium">{alert.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      IP: {alert.ip} • {formatDate(alert.timestamp)}
                    </p>
                    {alert.userAgent && (
                      <p className="text-xs text-muted-foreground mt-1">{alert.userAgent}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login & Security Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login & Security
          </CardTitle>
          <CardDescription>Your recent login information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Last Login</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDate(userSecurity?.lastLoginAt)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Last Login IP</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {userSecurity?.lastLoginIp || 'Unknown'}
            </p>
          </div>
          {/* Show trusted devices if any */}
          {userSecurity?.trustedDevices && userSecurity.trustedDevices.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Trusted Devices</p>
              <div className="space-y-2">
                {userSecurity.trustedDevices.map((device, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground p-2 border rounded">
                    {device.label} • Last seen: {formatDate(device.lastSeen)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};