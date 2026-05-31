import { apiFetch } from './api';

const BASE = '/api/clients';

export const ClientsService = {
  async getById(clientId) {
    return apiFetch(`${BASE}/${clientId}`);
  },

  async list(query = {}) {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.q) params.set('q', query.q);
    if (query.type) params.set('type', query.type);
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    const qs = params.toString();
    const url = `${BASE}${qs ? `?${qs}` : ''}`;
    return apiFetch(url);
  },

  async create(payload) {
    return apiFetch(BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(clientId, payload) {
    return apiFetch(`${BASE}/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(clientId) {
    return apiFetch(`${BASE}/${clientId}`, {
      method: 'DELETE',
    });
  },
};
