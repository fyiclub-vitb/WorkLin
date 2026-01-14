import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, LogIn, User, Lock, Mail } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demo credentials
  const DEMO_EMAIL = 'demo@worklin.com';
  const DEMO_PASSWORD = 'demo123';

  const handleLogin = async (e: React.FormEvent) => {
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
    } else {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to home</span>
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
              W
            </div>
            <CardTitle className="text-3xl font-bold">Welcome to WorkLin</CardTitle>
            <CardDescription className="text-base">
              Sign in to your workspace or try the demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@worklin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Demo Credentials Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  🎯 Demo Credentials
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Use these credentials to try WorkLin:
                </p>
                <div className="space-y-1 text-xs font-mono text-blue-800 dark:text-blue-200">
                  <p><strong>Email:</strong> demo@worklin.com</p>
                  <p><strong>Password:</strong> demo123</p>
                </div>
                <Button
                  type="button"
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full mt-3 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  Use Demo Credentials
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
                  >
                    Demo mode available
                  </button>
                </p>
              </div>
            </form>

            {/* Future Firebase Auth */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                🔒 Full authentication with Firebase coming soon
                <br />
                <span className="text-blue-600 dark:text-blue-400">
                  See <Link to="/" className="underline">GITHUB_ISSUES.md</Link> for contribution opportunities
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
