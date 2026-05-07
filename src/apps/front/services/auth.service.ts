const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';

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
      });

      if (!response.ok) {
        return null; // Usuário não autenticado
      }

      return await response.json().catch(() => null);
    } catch (error) {
      console.error('Erro no AuthService.getProfile:', error);
      return null;
    }
  }
};
