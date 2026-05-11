const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pmv-ads-2026-1-e4-proj-infra-t3-meupj.onrender.com';
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const AuthService = {
  /**
   * Realiza o login do usuário
   */
  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao autenticar usuário. Verifique suas credenciais.');
      }

      return await response.json().catch(() => null);
    } catch (error) {
      console.error('Erro no AuthService.login:', error);
      throw error;
    }
  },

  /**
   * Cria um novo usuário
   */
  async register(userData: RegisterData) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao criar conta. Tente novamente.');
      }

      return await response.json().catch(() => null);
    } catch (error) {
      console.error('Erro no AuthService.register:', error);
      throw error;
    }
  },

  /**
   * Busca o perfil do usuário logado
   */
  async getProfile() {
    try {
      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        return null; // Usuário não autenticado
      }

      return await response.json().catch(() => null);
    } catch (error) {
      console.error('Erro no AuthService.getProfile:', error);
      return null;
    }
  },

  /**
   * Realiza o logout do usuário
   */
  async logout() {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        console.error('Logout falhou na API', await response.text());
      }
      return response.ok;
    } catch (error) {
      console.error('Erro no AuthService.logout:', error);
      return false;
    }
  }
};
