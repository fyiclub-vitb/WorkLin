import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, LogIn, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { loginWithEmail, loginWithGoogle, signUpWithEmail, resetPassword } from '../lib/firebase/auth';
import { LogoIcon } from '../components/Logo';

// The Login page handles user authentication.
// It supports Email/Password login, Sign Up, Google Auth, and Password Reset.
export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle email/password authentication (both login and sign up)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { user, error } = await signUpWithEmail(email, password, displayName);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to WorkLin!',
          });
          navigate('/app');
        }
      } else {
        const { user, error } = await loginWithEmail(email, password);
        if (error) {
          toast({
            title: 'Login failed',
            description: error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have been logged in successfully.',
          });
          navigate('/app');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google authentication (popup)
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { user, error } = await loginWithGoogle();
      if (error) {
        toast({
          title: 'Google sign in failed',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome!',
          description: 'You have been logged in with Google.',
        });
        navigate('/app');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle the forgot password flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: 'Password reset failed',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password reset email sent!',
          description: 'Check your inbox for instructions to reset your password.',
        });
        setShowForgotPassword(false);
        setEmail(''); // Clear email for security
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-all hover:scale-105"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to home</span>
        </Link>

        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 pb-8">
            <div className="mx-auto mb-3">
              <LogoIcon size={80} />
            </div>
            <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Welcome to WorkLin
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Create your account' : 'Sign in to your workspace'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <KeyRound className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Reset Password
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="resetEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Mail size={18} className="mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full h-11"
                    disabled={loading}
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Name
                    </label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isSignUp}
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Lock size={16} />
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  {loading ? (
                    'Please wait...'
                  ) : (
                    <>
                      <LogIn size={18} className="mr-2" />
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-12 border-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 hover:scale-[1.02] transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
