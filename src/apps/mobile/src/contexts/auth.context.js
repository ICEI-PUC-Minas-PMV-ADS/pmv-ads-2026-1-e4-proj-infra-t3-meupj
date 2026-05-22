import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

const AuthContext = createContext({});

/**
 * Provedor de Autenticação
 * Gerencia o estado global do usuário no App
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui os colegas podem implementar a verificação de token persistente (AsyncStorage)
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const profile = await AuthService.getProfile();
      if (profile) setUser(profile.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await AuthService.login(credentials);
    // Lógica para salvar usuário no estado e persistir token
    // setUser(data.user);
    return data;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
