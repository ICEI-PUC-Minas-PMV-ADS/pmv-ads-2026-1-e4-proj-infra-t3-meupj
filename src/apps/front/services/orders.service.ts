const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/';// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'draft'
  | 'pendingApproval'
  | 'inProgress'
  | 'completed'
  | 'warranty'
  | 'cancelled';

export type PaymentMethod =
  | 'pix'
  | 'cash'
  | 'creditCard'
  | 'debitCard'
  | 'bankTransfer'
  | 'bankSlip';

export interface OrderItem {
  catalogItemId: string;
  type: string;
  name: string;
  description?: string;
  unitPrice: number;
  unitMeasure: string;
  quantity: number;
  subtotal: number;
  position: number;
}

export interface Order {
  _id: string;
  profileId: string;
  clientId: string | null;
  orderNumber: string;
  reference?: string;
  status: OrderStatus;
  paymentMethods: PaymentMethod[];
  items: OrderItem[];
  discount?: number;
  fees?: number;
  total: number;
  paymentTerms?: string;
  warrantyTerms?: string;
  additionalInfo?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  q?: string;
  clientId?: string;
  status?: OrderStatus;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'createdAt' | 'orderNumber' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderCreatePayload {
  clientId?: string | null;
  items: { catalogItemId: string; quantity: number }[];
  discount?: number;
  fees?: number;
  paymentMethods?: PaymentMethod[];
  paymentSchedule?: { amount: number; dueDate: string; paymentMethod?: PaymentMethod }[];
  status?: OrderStatus;
  reference?: string;
  paymentTerms?: string;
  warrantyTerms?: string;
  additionalInfo?: string;
  internalNotes?: string;
}

export interface OrderUpdatePayload {
  clientId?: string | null;
  items?: { catalogItemId: string; quantity: number }[];
  discount?: number;
  fees?: number;
  paymentMethods?: PaymentMethod[];
  status?: OrderStatus;
  reference?: string;
  paymentTerms?: string;
  warrantyTerms?: string;
  additionalInfo?: string;
  internalNotes?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const OrdersService = {
  /**
   * Lista pedidos com suporte a filtros, paginação e busca
   */
  async list(query: OrderListQuery = {}): Promise<OrderListResponse> {
    const params = new URLSearchParams();

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.q) params.set('q', query.q);
    if (query.clientId) params.set('clientId', query.clientId);
    if (query.status) params.set('status', query.status);
    if (query.createdFrom) params.set('createdFrom', query.createdFrom);
    if (query.createdTo) params.set('createdTo', query.createdTo);
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    const qs = params.toString();
    const url = `${BASE_URL}/api/orders${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao carregar pedidos.');
    }

    return response.json();
  },

  /**
   * Cria um novo pedido
   */
  async create(payload: OrderCreatePayload): Promise<Order> {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao criar pedido.');
    }

    return response.json();
  },

  /**
   * Atualiza um pedido existente
   */
  async update(orderId: string, payload: OrderUpdatePayload): Promise<Order> {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao atualizar pedido.');
    }

    return response.json();
  },

  /**
   * Remove um pedido (somente se não tiver transações confirmadas)
   */
  async delete(orderId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Este pedido possui transações confirmadas e não pode ser excluído.');
      }
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao excluir pedido.');
    }
  },
};
