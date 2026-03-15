import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration purposes
const mockUsers = {
  'employee@school.com': {
    id: 'emp-001',
    email: 'employee@school.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    schoolBranch: 'Main Campus',
    joinDate: new Date('2022-01-15'),
    position: 'Professor',
  },
  'hr@school.com': {
    id: 'hr-001',
    email: 'hr@school.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.HR,
    department: 'Human Resources',
    schoolBranch: 'Main Campus',
    joinDate: new Date('2020-06-01'),
    position: 'HR Manager',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Convert date strings back to Date objects
        parsedUser.joinDate = new Date(parsedUser.joinDate);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock authentication - check if user exists and role matches
      const mockUser = mockUsers[email as keyof typeof mockUsers];
      if (mockUser && mockUser.role === role) {
        setUser(mockUser as User);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else {
        throw new Error('Invalid credentials or role mismatch');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
