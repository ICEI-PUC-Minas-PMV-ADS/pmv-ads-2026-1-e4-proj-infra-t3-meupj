'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Loader2, AlertCircle, Package, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { CatalogService, type CatalogItem, type CatalogItemType, type CatalogUnitMeasure } from '@/services/catalog.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 20;

const UNIT_MEASURE_LABELS: Record<CatalogUnitMeasure, string> = {
  unit:        'un',
  dozen:       'dz',
  hour:        'h',
  day:         'dia',
  week:        'sem',
  month:       'mês',
  meter:       'm',
  squareMeter: 'm²',
  kilogram:    'kg',
  box:         'cx',
  kit:         'kit',
  piece:       'pç',
};

type TabKey = 'all' | CatalogItemType;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',     label: 'Todos' },
  { key: 'product', label: 'Produtos' },
  { key: 'service', label: 'Serviços' },
];

const TYPE_STYLE: Record<CatalogItemType, { badge: string; label: string; text: string }> = {
  product: { badge: 'bg-amber-100/50 text-amber-800', label: 'Produto',  text: 'text-amber-800' },
  service: { badge: 'bg-indigo-50 text-indigo-700',   label: 'Serviço',  text: 'text-indigo-700' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CatalogoPage() {
  const router = useRouter();

  const [items, setItems]               = useState<CatalogItem[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState<TabKey>('all');
  const [counts, setCounts]             = useState<Record<string, number>>({});
  const [mobileSearch, setMobileSearch] = useState(false);

  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const fetchItems = useCallback(async (tab: TabKey, q: string, pg: number) => {
    setLoading(true);
    setError('');
    try {
      const trimmedQ = q.trim() || undefined;

      const [result, productCount, serviceCount] = await Promise.all([
        CatalogService.list({
          type: tab !== 'all' ? (tab as CatalogItemType) : undefined,
          q: trimmedQ,
          page: pg,
          limit: PAGE_LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        CatalogService.list({ type: 'product', q: trimmedQ, limit: 1 }),
        CatalogService.list({ type: 'service', q: trimmedQ, limit: 1 }),
      ]);

      setItems(result.data);
      setTotal(result.total);
      setCounts({
        all:     productCount.total + serviceCount.total,
        product: productCount.total,
        service: serviceCount.total,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Erro ao carregar catálogo.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchItems(activeTab, search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeTab, fetchItems]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    fetchItems(activeTab, search, newPage);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await CatalogService.delete(confirmDelete._id);
      setConfirmDelete(null);
      fetchItems(activeTab, search, page);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Falha ao excluir item.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-4 py-3 md:px-10 md:py-6 border-b border-gray-100 flex flex-col gap-3 md:gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Catálogo</h1>

          {/* Busca — desktop inline */}
          <div className="relative max-w-md flex-1 hidden md:block ml-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-500 font-medium text-gray-800"
              placeholder="Buscar produtos e serviços..."
            />
          </div>

          <div className="flex gap-2">
            {/* Lupa mobile — toggle */}
            <button
              type="button"
              onClick={() => { setMobileSearch((v) => !v); if (mobileSearch) setSearch(''); }}
              aria-label={mobileSearch ? 'Fechar busca' : 'Abrir busca'}
              title={mobileSearch ? 'Fechar busca' : 'Abrir busca'}
              className={`md:hidden p-2 rounded-lg border transition-colors ${
                mobileSearch
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Search size={18} />
            </button>

            <Link
              href="/catalogo/novo"
              className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} />
              Novo item
            </Link>
          </div>
        </div>

        {/* Busca expandida — mobile */}
        {mobileSearch && (
          <div className="md:hidden relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white placeholder:text-gray-400 font-medium text-gray-800"
              placeholder="Buscar produtos e serviços..."
            />
          </div>
        )}

        {/* Tabs */}
        <nav className="flex gap-5 sm:gap-8 -mb-3 md:-mb-6 border-t border-gray-100 pt-3 md:pt-4 overflow-x-auto no-scrollbar pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const countKey = tab.key === 'all' ? 'all' : tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`border-b-2 pb-4 text-sm font-semibold px-1 whitespace-nowrap flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium'
                }`}
              >
                {tab.label}
                {(counts[countKey] ?? 0) > 0 && (
                  <span className={`py-0.5 px-2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {counts[countKey]}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Backdrop transparente para fechar o menu ao clicar fora */}
      {openMenuId && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
      )}

      <main className="flex-1 p-4 md:p-10 bg-gray-50/30 overflow-y-auto">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando catálogo...</p>
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => fetchItems(activeTab, search, page)}
              className="ml-auto text-red-700 underline text-xs font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Package className="h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Nenhum item encontrado</p>
            <Link
              href="/catalogo/novo"
              className="mt-2 text-sm text-indigo-600 font-medium hover:underline"
            >
              Adicionar primeiro item
            </Link>
          </div>
        )}

        {/* Conteúdo */}
        {!loading && !error && items.length > 0 && (
          <>
            {/* Grid — desktop */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {items.map((item) => {
                const style     = TYPE_STYLE[item.type];
                const unitLabel = UNIT_MEASURE_LABELS[item.unitMeasure];

                return (
                  <div
                    key={item._id}
                    className="relative bg-white rounded-xl hover:shadow-lg transition-all group cursor-pointer p-4 flex flex-col gap-3 border border-gray-200 hover:border-indigo-400"
                    onClick={() => router.push(`/catalogo/${item._id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex ${style.badge}`}>
                        {style.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item._id ? null : item._id);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    <h3 className="font-bold text-gray-900 text-[15px] truncate">{item.name}</h3>
                    {item.description && (
                      <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed -mt-1">{item.description}</p>
                    )}
                    <p className="text-[13px] font-bold text-indigo-600 mt-auto">
                      {formatCurrency(item.unitPrice)}
                      <span className="text-gray-400 font-medium">/{unitLabel}</span>
                    </p>

                    {/* Dropdown menu */}
                    {openMenuId === item._id && (
                      <div className="absolute top-10 right-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[150px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            router.push(`/catalogo/${item._id}`);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={14} className="text-gray-500" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setConfirmDelete(item);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Card "Novo item" */}
              <Link
                href="/catalogo/novo"
                className="border-2 border-dashed border-gray-200 rounded-xl h-full min-h-[120px] flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all gap-3 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110">
                  <Plus size={24} className="group-hover:text-indigo-600 transition-colors" />
                </div>
                <span className="text-sm font-semibold">Novo item</span>
              </Link>
            </div>

            {/* Lista — mobile */}
            <div className="sm:hidden flex flex-col gap-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {items.map((item) => {
                const style     = TYPE_STYLE[item.type];
                const unitLabel = UNIT_MEASURE_LABELS[item.unitMeasure];

                return (
                  <div
                    key={item._id}
                    className="relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/catalogo/${item._id}`)}
                  >
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${style.text}`}>
                        {style.label}
                      </span>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right mr-1">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(item.unitPrice)}</p>
                      <p className="text-[11px] text-gray-400">/{unitLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item._id ? null : item._id);
                      }}
                      aria-label={`Abrir ações de ${item.name}`}
                      title={`Abrir ações de ${item.name}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Dropdown menu mobile */}
                    {openMenuId === item._id && (
                      <div className="absolute top-2 right-12 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[150px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            router.push(`/catalogo/${item._id}`);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={14} className="text-gray-500" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setConfirmDelete(item);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 pb-4">
                <button
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-500 font-medium min-w-[100px] text-center">
                  Página {page} de {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* FAB mobile */}
        <Link
          href="/catalogo/novo"
          aria-label="Novo item"
          title="Novo item"
          className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40"
        >
          <Plus size={24} />
        </Link>
      </main>

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-gray-900">Excluir item?</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Tem certeza que deseja excluir{' '}
                  <span className="font-semibold text-gray-700">&quot;{confirmDelete.name}&quot;</span>?
                  {' '}Esta ação não pode ser desfeita.
                </p>
              </div>

              {deleteError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => { setConfirmDelete(null); setDeleteError(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
