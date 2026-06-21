import type { SettingsProfileResponse } from './settings.service';

import { apiClient, isApiErrorStatus, resolveApiErrorMessage } from './api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export type AuthProfileResponse = SettingsProfileResponse;

export const AuthService = {
  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginCredentials) {
    try {
      return await apiClient.post<unknown>('/api/auth/sign-in/email', {
        body: credentials,
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao autenticar usuário. Verifique suas credenciais.'),
      );
    }
  },

  /**
   * Cria um novo usuário
   */
  async register(userData: RegisterData) {
    try {
      return await apiClient.post<unknown>('/api/auth/sign-up/email', {
        body: userData,
      });
    } catch (error) {
      throw new Error(resolveApiErrorMessage(error, 'Falha ao criar conta. Tente novamente.'));
    }
  },

  /**
   * Busca o perfil do usuário logado
   */
  async getProfile(): Promise<AuthProfileResponse | null> {
    try {
      return await apiClient.get<AuthProfileResponse>('/api/profile', {
        cache: 'no-store',
      });
    } catch (error) {
      if (isApiErrorStatus(error, 401)) {
        return null;
      }

      return null;
    }
  },

  /**
   * Realiza o logout do usuário
   */
  async logout() {
    try {
      await apiClient.post<void>('/api/auth/sign-out', {
        body: {},
        parseAs: 'none',
      });
      return true;
    } catch {
      return false;
    }
  },
};
