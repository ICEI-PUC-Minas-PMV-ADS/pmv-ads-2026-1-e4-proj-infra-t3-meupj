import { apiFetch } from './api';
import { authClient } from './auth-client';

const getErrorMessage = (error, fallback) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const assertAuthAction = (result, fallbackMessage) => {
  if (result?.error) {
    throw new Error(result.error.message || fallbackMessage);
  }

  return result?.data ?? null;
};

/**
 * Serviço de autenticação baseado no Better Auth client.
 */
export const AuthService = {
  async login(credentials) {
    const result = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    });

    assertAuthAction(result, 'Falha ao autenticar usuário. Verifique suas credenciais.');

    return this.getProfile();
  },

  async register(userData) {
    const result = await authClient.signUp.email({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });

    assertAuthAction(result, 'Falha ao criar conta. Tente novamente.');

    return this.getProfile();
  },

  async getProfile() {
    try {
      return await apiFetch('/api/profile', {
        method: 'GET',
        skipUnauthorizedHandler: true,
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return null;
      }

      throw new Error(getErrorMessage(error, 'Falha ao carregar perfil.'));
    }
  },

  async logout() {
    try {
      const result = await authClient.signOut();
      assertAuthAction(result, 'Falha ao encerrar sessão.');
      return true;
    } catch (error) {
      console.error('Erro no AuthService.logout:', error);
      return false;
    }
  },
};
