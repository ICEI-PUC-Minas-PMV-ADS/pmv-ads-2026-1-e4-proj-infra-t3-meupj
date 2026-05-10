const BASE_URL = 'https://meupj-api-student.delightfulwave-8b9abc5f.brazilsouth.azurecontainerapps.io';

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
    const params = new URLSearchParams();

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.q) params.set('q', query.q);
    if (query.type) params.set('type', query.type);
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    const qs = params.toString();
    const url = `${BASE_URL}/api/clients${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao carregar clientes.');
    }

    return response.json();
  },

  /**
   * Busca um cliente pelo ID
   */
  async getById(clientId: string): Promise<Client> {
    const response = await fetch(`${BASE_URL}/api/clients/${clientId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      if (response.status === 404) throw new Error('Cliente não encontrado.');
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao buscar cliente.');
    }

    return response.json();
  },

  /**
   * Cria um novo cliente
   */
  async create(payload: ClientCreatePayload): Promise<Client> {
    const response = await fetch(`${BASE_URL}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao criar cliente.');
    }

    return response.json();
  },

  /**
   * Atualiza um cliente existente
   */
  async update(clientId: string, payload: ClientUpdatePayload): Promise<Client> {
    const response = await fetch(`${BASE_URL}/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      if (response.status === 404) throw new Error('Cliente não encontrado.');
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao atualizar cliente.');
    }

    return response.json();
  },

  /**
   * Remove um cliente (somente se não estiver vinculado a pedidos)
   */
  async delete(clientId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/clients/${clientId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      if (response.status === 404) throw new Error('Cliente não encontrado.');
      if (response.status === 409) {
        throw new Error('Este cliente está vinculado a pedidos e não pode ser excluído.');
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao excluir cliente.');
    }
  },
};
