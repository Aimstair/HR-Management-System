import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRouteForRole } from '../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

/**
 * Login Page
 * Allows users to login with email and password only.
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const authenticatedUser = await login(email, password);
      navigate(getDefaultRouteForRole(authenticatedUser.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // Quick login helpers
  const quickLogin = async (testEmail: string) => {
    try {
      const authenticatedUser = await login(testEmail, 'Password123!');
      navigate(getDefaultRouteForRole(authenticatedUser.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">HR Management System</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">{error}</div>}

            {/* Login Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Login Demo */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4 text-center">Demo Credentials (Password: Password123!)</p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => quickLogin('employee.teaching@school.com')}
                disabled={loading}
              >
                Login as Teaching Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => quickLogin('head.hr@school.com')}
                disabled={loading}
              >
                Login as Head HR
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => quickLogin('campus.hr.main@school.com')}
                disabled={loading}
              >
                Login as Main Campus HR
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => quickLogin('employee.staff@school.com')}
                disabled={loading}
              >
                Login as Non-Teaching Employee
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
