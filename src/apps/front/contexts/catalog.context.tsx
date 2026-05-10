'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CatalogService, type CatalogItem, type CatalogListQuery, type CatalogUnitMeasure } from '@/services/catalog.service';

export interface CatalogOption {
  id: string;
  name: string;
  unitPrice: number;
  unitMeasure: CatalogUnitMeasure;
}

interface CatalogContextValue {
  items: CatalogItem[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchItems: (query?: CatalogListQuery) => Promise<void>;
  refreshItems: () => Promise<void>;
  catalogOptions: CatalogOption[];
  loadCatalogOptions: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<CatalogListQuery>({});
  const [catalogOptions, setCatalogOptions] = useState<CatalogOption[]>([]);

  const fetchItems = useCallback(async (query: CatalogListQuery = {}) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const response = await CatalogService.list(query);
      setItems(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar catálogo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshItems = useCallback(async () => {
    await fetchItems(lastQuery);
  }, [fetchItems, lastQuery]);

  const loadCatalogOptions = useCallback(async () => {
    try {
      const response = await CatalogService.list({
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      setCatalogOptions(
        response.data.map((item) => ({
          id: item._id,
          name: item.name,
          unitPrice: item.unitPrice,
          unitMeasure: item.unitMeasure,
        })),
      );
    } catch {
      setCatalogOptions([]);
    }
  }, []);

  const value: CatalogContextValue = {
    items,
    total,
    loading,
    error,
    fetchItems,
    refreshItems,
    catalogOptions,
    loadCatalogOptions,
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog deve ser usado dentro de um <CatalogProvider>');
  }
  return context;
}
