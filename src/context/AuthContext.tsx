import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types';
import { ApiUser, loginRequest, logoutRequest, meRequest, refreshRequest } from '../lib/auth-api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'auth.session';

interface StoredSession {
  accessToken: string;
  user: ApiUser;
}

const parseApiUser = (user: ApiUser): User => {
  return {
    ...user,
    department: user.department ?? '',
    schoolBranch: user.schoolBranch ?? '',
    position: user.position ?? '',
    joinDate: new Date(user.joinDate),
  };
};

const loadStoredSession = (): StoredSession | null => {
  const rawSession = localStorage.getItem(SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const saveStoredSession = (session: StoredSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const clearStoredSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const hydrateSession = async (): Promise<void> => {
      setLoading(true);

      try {
        const stored = loadStoredSession();

        if (stored?.accessToken) {
          try {
            const meResponse = await meRequest(stored.accessToken);
            const parsedUser = parseApiUser(meResponse.user);
            setUser(parsedUser);
            saveStoredSession({
              accessToken: stored.accessToken,
              user: meResponse.user,
            });
            return;
          } catch {
            clearStoredSession();
          }
        }

        const refreshed = await refreshRequest();
        const parsedUser = parseApiUser(refreshed.user);
        setUser(parsedUser);
        saveStoredSession({
          accessToken: refreshed.accessToken,
          user: refreshed.user,
        });
      } catch {
        setUser(null);
        clearStoredSession();
      } finally {
        setLoading(false);
      }
    };

    void hydrateSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);

    try {
      const authPayload = await loginRequest(email, password);
      const parsedUser = parseApiUser(authPayload.user);
      setUser(parsedUser);
      saveStoredSession({
        accessToken: authPayload.accessToken,
        user: authPayload.user,
      });
      return parsedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutRequest();
    } catch {
      // Always clear local state even if backend logout fails.
    }

    setUser(null);
    clearStoredSession();
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
