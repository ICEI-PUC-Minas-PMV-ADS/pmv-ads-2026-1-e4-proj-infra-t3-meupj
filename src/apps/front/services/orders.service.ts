import { apiClient, resolveApiErrorMessage } from './api-client';
// ─── Types ────────────────────────────────────────────────────────────────────

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
  clientName?: string;
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
    try {
      return await apiClient.get<OrderListResponse>('/api/orders', { query });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar pedidos.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  /**
   * Obtém um pedido pelo ID
   */
  async getById(orderId: string): Promise<Order> {
    try {
      return await apiClient.get<Order>(`/api/orders/${orderId}`);
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar pedido.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Pedido não encontrado.',
        }),
      );
    }
  },

  /**
   * Cria um novo pedido
   */
  async create(payload: OrderCreatePayload): Promise<Order> {
    try {
      return await apiClient.post<Order>('/api/orders', { body: payload });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao criar pedido.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  /**
   * Atualiza um pedido existente
   */
  async update(orderId: string, payload: OrderUpdatePayload): Promise<Order> {
    try {
      return await apiClient.put<Order>(`/api/orders/${orderId}`, { body: payload });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao atualizar pedido.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Pedido não encontrado.',
          409: 'Falha ao atualizar pedido.',
        }),
      );
    }
  },

  /**
   * Remove um pedido (somente se não tiver transações confirmadas)
   */
  async delete(orderId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/orders/${orderId}`, { parseAs: 'none' });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao excluir pedido.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Pedido não encontrado.',
          409: 'Este pedido possui transações confirmadas e não pode ser excluído.',
        }),
      );
    }
  },
};
