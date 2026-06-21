import { apiFetch } from './api';

/**
 * Serviço de Pedidos (Orders)
 * Gerencia criação, listagem, edição e exclusão de pedidos
 */
export const OrdersService = {
  /**
   * Lista pedidos com suporte a filtros, paginação e busca
   */
  async list(query = {}) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    const endpoint = `/api/orders${qs ? `?${qs}` : ''}`;

    return apiFetch(endpoint, { method: 'GET' });
  },

  /**
   * Obtém um pedido pelo ID
   */
  async getById(orderId) {
    return apiFetch(`/api/orders/${orderId}`, { method: 'GET' });
  },

  /**
   * Cria um novo pedido
   */
  async create(payload) {
    return apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Atualiza um pedido existente
   */
  async update(orderId, payload) {
    return apiFetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Remove um pedido (somente se não tiver transações confirmadas)
   */
  async delete(orderId) {
    return apiFetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lista clientes disponíveis para seleção no pedido
   */
  async listClients() {
    return apiFetch('/api/clients?limit=200', { method: 'GET' });
  },

  /**
   * Lista itens do catálogo disponíveis para seleção no pedido
   */
  async listCatalog() {
    return apiFetch('/api/catalog?limit=200', { method: 'GET' });
  },
};
