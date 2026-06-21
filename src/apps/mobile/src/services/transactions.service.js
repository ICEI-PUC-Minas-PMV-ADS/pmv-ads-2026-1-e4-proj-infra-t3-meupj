import { apiFetch } from './api';

/**
 * Serviço de Transações (Financeiro)
 * Gerencia receitas e custos
 */
export const TransactionsService = {
  /**
   * Cria um novo lançamento de receita ou custo
   */
  async create(type, payload) {
    const endpoint = type === 'income' ? 'income' : 'expense';
    return apiFetch(`/api/transactions/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Lista lançamentos com filtros
   */
  async list(query = {}) {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Se for limit ou page, garante que estamos tentando enviar como número 
        // (embora URLSearchParams sempre converta para string, o objetivo é ser explícito)
        if (key === 'limit' || key === 'page') {
          params.set(key, Number(value).toString());
        } else {
          params.set(key, String(value));
        }
      }
    });

    const qs = params.toString();
    const endpoint = `/api/transactions${qs ? `?${qs}` : ''}`;

    return apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Confirma um lançamento pendente
   */
  async confirm(transactionId) {
    return apiFetch(`/api/transactions/${transactionId}/confirm`, {
      method: 'PATCH',
    });
  },

  /**
   * Busca um lançamento pelo ID
   */
  async getById(transactionId) {
    return apiFetch(`/api/transactions/${transactionId}`, {
      method: 'GET',
    });
  },

  /**
   * Atualiza um lançamento existente
   */
  async update(transactionId, payload) {
    return apiFetch(`/api/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Exclui um lançamento
   */
  async delete(transactionId) {
    return apiFetch(`/api/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }
};
