import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { loginWithEmail, signUpWithEmail, loginWithGoogle } from '../../lib/firebase/auth';
import { useToast } from '../../hooks/use-toast';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'login' | 'signup';
}

// This dialog handles both login and signup in one component
export const AuthDialog: React.FC<AuthDialogProps> = ({
  open,
  onOpenChange,
  mode: initialMode = 'login', // Default to login if not specified
}) => {
  // Track whether we're in login or signup mode
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // Only used for signup
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast(); // For showing success/error messages

  // Handle email/password auth (both login and signup)
  const handleEmailAuth = async () => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        // Create new account
        const { user, error } = await signUpWithEmail(email, password, displayName);
        if (error) {
          // Show error message if signup failed
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
        } else {
          // Success! Close the dialog
          toast({
            title: 'Success',
            description: 'Account created successfully!',
          });
          onOpenChange(false);
        }
      } else {
        // Login with existing account
        const { user, error } = await loginWithEmail(email, password);
        if (error) {
          toast({
            title: 'Error',
            description: error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Logged in successfully!',
          });
          onOpenChange(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth login
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
      } else {
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Login' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Enter your credentials to access WorkLin'
              : 'Create a new account to get started'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Display name field - only show during signup */}
          {mode === 'signup' && (
            <div className="grid gap-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}
          
          {/* Email field - shown for both login and signup */}
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {/* Password field */}
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-2">
          {/* Primary action button - changes text based on mode */}
          <Button
            onClick={handleEmailAuth}
            disabled={loading || !email || !password}
            className="w-full"
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
          
          {/* Google OAuth button */}
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Continue with Google
          </Button>
          
          {/* Toggle between login and signup */}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Login'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};