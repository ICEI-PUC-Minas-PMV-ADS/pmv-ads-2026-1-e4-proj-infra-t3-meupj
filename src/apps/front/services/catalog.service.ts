const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pmv-ads-2026-1-e4-proj-infra-t3-meupj.onrender.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CatalogItemType = 'product' | 'service';

export type CatalogUnitMeasure =
  | 'unit'
  | 'dozen'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'meter'
  | 'squareMeter'
  | 'kilogram'
  | 'box'
  | 'kit'
  | 'piece';

export interface CatalogItem {
  _id: string;
  profileId: string;
  type: CatalogItemType;
  name: string;
  description?: string;
  unitPrice: number;
  unitMeasure: CatalogUnitMeasure;
  costPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogListResponse {
  data: CatalogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CatalogListQuery {
  page?: number;
  limit?: number;
  q?: string;
  type?: CatalogItemType;
  sortBy?: 'name' | 'unitPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CatalogCreatePayload {
  type: CatalogItemType;
  name: string;
  unitPrice: number;
  unitMeasure: CatalogUnitMeasure;
  description?: string;
  costPrice?: number;
}

export interface CatalogUpdatePayload {
  type?: CatalogItemType;
  name?: string;
  unitPrice?: number;
  unitMeasure?: CatalogUnitMeasure;
  description?: string;
  costPrice?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const CatalogService = {
  async getById(itemId: string): Promise<CatalogItem> {
    const response = await fetch(`${BASE_URL}/api/catalog/${itemId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      if (response.status === 404) throw new Error('Item não encontrado.');
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Falha ao carregar item.');
    }

    return response.json() as Promise<CatalogItem>;
  },

  async list(query: CatalogListQuery = {}): Promise<CatalogListResponse> {
    const params = new URLSearchParams();

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.q) params.set('q', query.q);
    if (query.type) params.set('type', query.type);
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    const qs = params.toString();
    const url = `${BASE_URL}/api/catalog${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Falha ao carregar catálogo.');
    }

    return response.json() as Promise<CatalogListResponse>;
  },

  async create(payload: CatalogCreatePayload): Promise<CatalogItem> {
    const response = await fetch(`${BASE_URL}/api/catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Falha ao criar item.');
    }

    return response.json() as Promise<CatalogItem>;
  },

  async update(itemId: string, payload: CatalogUpdatePayload): Promise<CatalogItem> {
    const response = await fetch(`${BASE_URL}/api/catalog/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      if (response.status === 404) throw new Error('Item não encontrado.');
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Falha ao atualizar item.');
    }

    return response.json() as Promise<CatalogItem>;
  },

  async delete(itemId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/catalog/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Este item está vinculado a pedidos existentes e não pode ser excluído.');
      }
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      if (response.status === 404) throw new Error('Item não encontrado.');
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Falha ao excluir item.');
    }
  },
};
