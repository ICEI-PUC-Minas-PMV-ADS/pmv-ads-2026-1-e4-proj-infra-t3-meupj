import { apiClient, resolveApiErrorMessage } from './api-client';

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
    try {
      return await apiClient.get<CatalogItem>(`/api/catalog/${itemId}`);
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar item.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Item não encontrado.',
        }),
      );
    }
  },

  async list(query: CatalogListQuery = {}): Promise<CatalogListResponse> {
    try {
      return await apiClient.get<CatalogListResponse>('/api/catalog', { query });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar catálogo.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  async create(payload: CatalogCreatePayload): Promise<CatalogItem> {
    try {
      return await apiClient.post<CatalogItem>('/api/catalog', { body: payload });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao criar item.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  async update(itemId: string, payload: CatalogUpdatePayload): Promise<CatalogItem> {
    try {
      return await apiClient.put<CatalogItem>(`/api/catalog/${itemId}`, { body: payload });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao atualizar item.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Item não encontrado.',
        }),
      );
    }
  },

  async delete(itemId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/catalog/${itemId}`, { parseAs: 'none' });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao excluir item.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Item não encontrado.',
          409: 'Este item está vinculado a pedidos existentes e não pode ser excluído.',
        }),
      );
    }
  },
};
