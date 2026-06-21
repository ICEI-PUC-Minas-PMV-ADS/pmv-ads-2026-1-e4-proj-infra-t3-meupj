'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import {
  AuthService,
  type AuthProfileResponse,
  type LoginCredentials,
  type RegisterData,
} from '../services/auth.service';

interface AuthContextType {
  user: AuthProfileResponse | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await AuthService.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapProfile = async () => {
      try {
        const profile = await AuthService.getProfile();
        if (!isMounted) {
          return;
        }

        setUser(profile);
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void bootstrapProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    await AuthService.login(credentials);
    await refreshProfile();
    router.push('/dashboard');
  };

  const register = async (data: RegisterData) => {
    await AuthService.register(data);
    await refreshProfile();
    router.push('/dashboard');
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    router.refresh();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
