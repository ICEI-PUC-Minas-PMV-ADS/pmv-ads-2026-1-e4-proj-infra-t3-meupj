const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3002';
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

export const TransactionsService = {
  /**
   * Cria um novo lançamento de receita ou custo
   */
  async create(type: TransactionType, payload: TransactionCreatePayload): Promise<Transaction> {
    const endpoint = type === 'income' ? 'income' : 'expense';
    const url = `${BASE_URL}/api/transactions/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Erro na API (${response.status}):`, errorData);
        throw new Error(errorData.message || `Falha ao criar lançamento de ${type} (Status: ${response.status}).`);
      }

      return response.json();
    } catch (error) {
      console.error(`Erro ao chamar ${url}:`, error);
      throw error;
    }
  },

  /**
   * Lista lançamentos com filtros e paginação
   */
  async list(query: TransactionListQuery = {}): Promise<TransactionListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    const url = `${BASE_URL}/api/transactions${qs ? `?${qs}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Erro na listagem (${response.status}):`, errorData);
        throw new Error(errorData.message || 'Falha ao carregar lançamentos.');
      }

      return response.json();
    } catch (error) {
      console.error(`Erro ao chamar listagem em ${url}:`, error);
      throw error;
    }
  },

  /**
   * Confirma um lançamento pendente
   */
  async confirm(transactionId: string): Promise<Transaction> {
    const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao confirmar lançamento.');
    }

    return response.json();
  },

  /**
   * Exclui um lançamento (somente se não estiver confirmado)
   */
  async delete(transactionId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao excluir lançamento.');
    }
  }
};
