import { CONFIG } from '../config';

/**
 * Cliente base para chamadas API
 * Centraliza headers, autenticação e tratamento de erros
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${CONFIG.API_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // No mobile, os cookies não são automáticos como na Web se não usarmos credentials
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    return await response.json().catch(() => null);
  } catch (error) {
    console.error(`Erro API [${endpoint}]:`, error);
    throw error;
  }
};
