import { apiFetch } from './api';

/**
 * Serviço de Autenticação
 * Espelha a lógica usada no frontend Web
 */
export const AuthService = {
  /**
   * Realiza o login
   */
  async login(credentials) {
    // return apiFetch('/api/auth/sign-in/email', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials),
    // });
    console.log('Skeleton: AuthService.login chamado com', credentials);
    return null;
  },

  /**
   * Cria um novo usuário
   */
  async register(userData) {
    // return apiFetch('/api/auth/sign-up/email', {
    //   method: 'POST',
    //   body: JSON.stringify(userData),
    // });
    console.log('Skeleton: AuthService.register chamado com', userData);
    return null;
  },

  /**
   * Busca o perfil do usuário
   */
  async getProfile() {
    // return apiFetch('/api/profile');
    return null;
  },

  /**
   * Logout
   */
  async logout() {
    // return apiFetch('/api/auth/sign-out', { method: 'POST' });
    return true;
  }
};
