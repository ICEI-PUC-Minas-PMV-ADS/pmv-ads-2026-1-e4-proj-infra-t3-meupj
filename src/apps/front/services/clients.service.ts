import { apiClient, resolveApiErrorMessage } from './api-client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PersonType = 'individual' | 'company';

export interface ClientAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country?: string;
}

export interface Client {
  _id: string;
  profileId: string;
  name: string;
  type: PersonType;
  document: string;
  email: string;
  phone: string;
  origin?: string;
  birthDate?: string;
  notes?: string;
  address: ClientAddress;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientListQuery {
  page?: number;
  limit?: number;
  q?: string;
  type?: PersonType;
  sortBy?: 'name' | 'email' | 'createdAt' | 'birthDate';
  sortOrder?: 'asc' | 'desc';
}

export interface ClientCreatePayload {
  name: string;
  type: PersonType;
  document: string;
  email: string;
  phone: string;
  origin?: string;
  birthDate?: string;
  notes?: string;
  address: ClientAddress;
}

export interface ClientUpdatePayload {
  name?: string;
  type?: PersonType;
  document?: string;
  email?: string;
  phone?: string;
  origin?: string;
  birthDate?: string;
  notes?: string;
  address?: ClientAddress;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const ClientsService = {
  /**
   * Lista clientes com suporte a filtros, paginação e busca
   */
  async list(query: ClientListQuery = {}): Promise<ClientListResponse> {
    try {
      return await apiClient.get<ClientListResponse>('/api/clients', { query });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar clientes.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  /**
   * Busca um cliente pelo ID
   */
  async getById(clientId: string): Promise<Client> {
    try {
      return await apiClient.get<Client>(`/api/clients/${clientId}`);
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao buscar cliente.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Cliente não encontrado.',
        }),
      );
    }
  },

  /**
   * Cria um novo cliente
   */
  async create(payload: ClientCreatePayload): Promise<Client> {
    try {
      return await apiClient.post<Client>('/api/clients', { body: payload });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao criar cliente.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  /**
   * Atualiza um cliente existente
   */
  async update(clientId: string, payload: ClientUpdatePayload): Promise<Client> {
    try {
      return await apiClient.put<Client>(`/api/clients/${clientId}`, { body: payload });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao atualizar cliente.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Cliente não encontrado.',
        }),
      );
    }
  },

  /**
   * Remove um cliente (somente se não estiver vinculado a pedidos)
   */
  async delete(clientId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/clients/${clientId}`, { parseAs: 'none' });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao excluir cliente.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Cliente não encontrado.',
          409: 'Este cliente está vinculado a pedidos e não pode ser excluído.',
        }),
      );
    }
  },
};
