import { CONFIG } from '../config';

/**
 * Cliente base para chamadas API
 * Centraliza headers, autenticação e tratamento de erros
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${CONFIG.API_URL}${endpoint}`;
  
  // Só inclui Content-Type quando há body (ex: POST/PUT). Requests sem body como DELETE
  // recebem 400 do servidor se esse header for enviado com body vazio.
  const contentType = options.body !== undefined ? { 'Content-Type': 'application/json' } : {};

  const defaultOptions = {
    headers: {
      ...contentType,
    },
    credentials: 'include',
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
