import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

/**
 * Login Page
 * Allows users to login with role selection for testing purposes
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, selectedRole);
      navigate(selectedRole === UserRole.EMPLOYEE ? '/portal/dashboard' : '/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // Quick login helpers
  const quickLogin = async (testEmail: string, role: UserRole) => {
    try {
      await login(testEmail, 'password', role);
      navigate(role === UserRole.EMPLOYEE ? '/portal/dashboard' : '/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                  <input
                    type="radio"
                    name="role"
                    value={UserRole.EMPLOYEE}
                    checked={selectedRole === UserRole.EMPLOYEE}
                    onChange={() => setSelectedRole(UserRole.EMPLOYEE)}
                  />
                  <span className="text-sm font-medium">Employee / Professor</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                  <input
                    type="radio"
                    name="role"
                    value={UserRole.HR}
                    checked={selectedRole === UserRole.HR}
                    onChange={() => setSelectedRole(UserRole.HR)}
                  />
                  <span className="text-sm font-medium">HR / Admin</span>
                </label>
              </div>
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
            <p className="text-sm text-muted-foreground mb-4 text-center">Demo Credentials</p>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => quickLogin('employee@school.com', UserRole.EMPLOYEE)}
                disabled={loading}
              >
                Login as Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                onClick={() => quickLogin('hr@school.com', UserRole.HR)}
                disabled={loading}
              >
                Login as HR Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
