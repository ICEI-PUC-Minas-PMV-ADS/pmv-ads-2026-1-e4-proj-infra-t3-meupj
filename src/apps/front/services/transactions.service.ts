import { apiClient, resolveApiErrorMessage } from './api-client';

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';

export type PaymentMethod =
  | 'pix'
  | 'cash'
  | 'creditCard'
  | 'debitCard'
  | 'bankTransfer'
  | 'bankSlip';

export interface Transaction {
  _id: string;
  profileId: string;
  type: TransactionType;
  clientId?: string;
  orderId?: string;
  status: TransactionStatus;
  displayStatus: TransactionStatus | 'overdue';
  paymentMethod?: PaymentMethod;
  amount: number;
  transactionDate: string;
  dueDate?: string;
  category?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCreatePayload {
  clientId?: string;
  orderId?: string;
  amount: number;
  transactionDate: string;
  dueDate?: string;
  paymentMethod?: PaymentMethod;
  category?: string;
  reference?: string;
  notes?: string;
  status?: TransactionStatus;
}

export interface TransactionListQuery {
  page?: number;
  limit?: number;
  q?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  clientId?: string;
  orderId?: string;
  paymentMethod?: PaymentMethod;
  category?: string;
  transactionFrom?: string;
  transactionTo?: string;
  sortBy?: 'createdAt' | 'transactionDate' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export type TransactionUpdatePayload = Partial<TransactionCreatePayload>;

export const TransactionsService = {
  /**
   * Cria um novo lançamento de receita ou custo
   */
  async create(type: TransactionType, payload: TransactionCreatePayload): Promise<Transaction> {
    const endpoint = type === 'income' ? 'income' : 'expense';

    try {
      return await apiClient.post<Transaction>(`/api/transactions/${endpoint}`, {
        body: payload,
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, `Falha ao criar lançamento de ${type}.`, {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  /**
   * Lista lançamentos com filtros e paginação
   */
  async list(query: TransactionListQuery = {}): Promise<TransactionListResponse> {
    try {
      return await apiClient.get<TransactionListResponse>('/api/transactions', {
        query,
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar lançamentos.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  /**
   * Confirma um lançamento pendente
   */
  async confirm(transactionId: string): Promise<Transaction> {
    try {
      return await apiClient.patch<Transaction>(`/api/transactions/${transactionId}/confirm`);
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao confirmar lançamento.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Lançamento não encontrado.',
        }),
      );
    }
  },

  /**
   * Busca um lançamento pelo ID
   */
  async getById(transactionId: string): Promise<Transaction> {
    try {
      return await apiClient.get<Transaction>(`/api/transactions/${transactionId}`);
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao buscar lançamento.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Lançamento não encontrado.',
        }),
      );
    }
  },

  /**
   * Atualiza um lançamento existente
   */
  async update(transactionId: string, payload: TransactionUpdatePayload): Promise<Transaction> {
    try {
      return await apiClient.put<Transaction>(`/api/transactions/${transactionId}`, {
        body: payload,
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao atualizar lançamento.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Lançamento não encontrado.',
        }),
      );
    }
  },

  /**
   * Exclui um lançamento (somente se não estiver confirmado)
   */
  async delete(transactionId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/transactions/${transactionId}`, {
        parseAs: 'none',
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao excluir lançamento.', {
          401: 'Não autorizado. Faça login novamente.',
          404: 'Lançamento não encontrado.',
          409: 'Lançamentos confirmados não podem ser excluídos.',
        }),
      );
    }
  },
};
