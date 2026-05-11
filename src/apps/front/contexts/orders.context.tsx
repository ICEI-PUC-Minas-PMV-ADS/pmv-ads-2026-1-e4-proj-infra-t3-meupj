'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { OrdersService, type Order, type OrderListQuery } from '@/services/orders.service';

interface OrdersContextValue {
  orders: Order[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchOrders: (query?: OrderListQuery) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<OrderListQuery>({});

  const fetchOrders = useCallback(async (query: OrderListQuery = {}) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const response = await OrdersService.list(query);
      setOrders(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await fetchOrders(lastQuery);
  }, [fetchOrders, lastQuery]);

  const value: OrdersContextValue = {
    orders,
    total,
    loading,
    error,
    fetchOrders,
    refreshOrders,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders deve ser usado dentro de um <OrdersProvider>');
  }
  return context;
}
