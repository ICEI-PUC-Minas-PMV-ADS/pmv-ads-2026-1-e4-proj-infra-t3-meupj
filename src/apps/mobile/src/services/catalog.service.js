import { apiFetch } from './api';

const BASE = '/api/catalog';

export const CatalogService = {
  async getById(itemId) {
    return apiFetch(`${BASE}/${itemId}`);
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

  async update(itemId, payload) {
    return apiFetch(`${BASE}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async delete(itemId) {
    return apiFetch(`${BASE}/${itemId}`, {
      method: 'DELETE',
    });
  },
};
