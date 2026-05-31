import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AuthService } from '../services/auth.service';
import { setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await AuthService.getProfile();
      setUser(profile?.user ?? null);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAuthState = async () => {
      setLoading(true);

      try {
        const profile = await AuthService.getProfile();
        if (mounted) {
          setUser(profile?.user ?? null);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const disposeUnauthorizedHandler = setUnauthorizedHandler(() => {
      setUser(null);
      setLoading(false);
    });

    loadAuthState();

    return () => {
      mounted = false;
      disposeUnauthorizedHandler();
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const profile = await AuthService.login(credentials);
    setUser(profile?.user ?? null);
  }, []);

  const register = useCallback(async (payload) => {
    const profile = await AuthService.register(payload);
    setUser(profile?.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
