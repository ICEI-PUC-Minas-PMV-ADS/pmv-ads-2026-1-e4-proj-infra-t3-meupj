'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ClientsService, type Client, type ClientListQuery, type PersonType } from '@/services/clients.service';

interface ClientsContextValue {
  clients: Client[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchClients: (query?: ClientListQuery) => Promise<void>;
  refreshClients: () => Promise<void>;
  clientOptions: { id: string; name: string }[];
  loadClientOptions: () => Promise<void>;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<ClientListQuery>({});
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([]);

  const fetchClients = useCallback(async (query: ClientListQuery = {}) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const response = await ClientsService.list(query);
      setClients(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshClients = useCallback(async () => {
    await fetchClients(lastQuery);
  }, [fetchClients, lastQuery]);

  const loadClientOptions = useCallback(async () => {
    try {
      const response = await ClientsService.list({
        limit: 200,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      setClientOptions(response.data.map((c) => ({ id: c._id, name: c.name })));
    } catch {
      setClientOptions([]);
    }
  }, []);

  const value: ClientsContextValue = {
    clients,
    total,
    loading,
    error,
    fetchClients,
    refreshClients,
    clientOptions,
    loadClientOptions,
  };

  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  );
}


export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients deve ser usado dentro de um <ClientsProvider>');
  }
  return context;
}
