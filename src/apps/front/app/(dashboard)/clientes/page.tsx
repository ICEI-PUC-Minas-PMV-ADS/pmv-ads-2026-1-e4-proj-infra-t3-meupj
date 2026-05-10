'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, User, Users, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { ClientsService, type Client, type PersonType } from '@/services/clients.service';
import { Input, Button, Alert, EmptyState, Spinner } from '@/components/ui';

const PAGE_LIMIT = 20;

type TabKey = 'all' | PersonType;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'individual', label: 'Pessoa Física' },
  { key: 'company', label: 'Pessoa Jurídica' },
];

const TYPE_STYLE: Record<PersonType, { badge: string; label: string; text: string }> = {
  individual: { badge: 'bg-indigo-50 text-indigo-700', label: 'PF', text: 'text-indigo-700' },
  company: { badge: 'bg-amber-100/50 text-amber-800', label: 'PJ', text: 'text-amber-800' },
};

function getContactInfo(client: { phone?: string; email?: string }) {
  const parts: string[] = [];
  if (client.phone) parts.push(client.phone);
  if (client.email) parts.push(client.email);
  return parts.join(' · ') || '—';
}

export default function ClientesPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mobileSearch, setMobileSearch] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const fetchClients = useCallback(async (tab: TabKey, q: string, pg: number) => {
    setLoading(true);
    setError('');
    try {
      const trimmedQ = q.trim() || undefined;

      const [result, pfCount, pjCount] = await Promise.all([
        ClientsService.list({
          type: tab !== 'all' ? (tab as PersonType) : undefined,
          q: trimmedQ,
          page: pg,
          limit: PAGE_LIMIT,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        ClientsService.list({ type: 'individual', q: trimmedQ, limit: 1 }),
        ClientsService.list({ type: 'company', q: trimmedQ, limit: 1 }),
      ]);

      setClients(result.data);
      setTotal(result.total);
      setCounts({
        all: pfCount.total + pjCount.total,
        individual: pfCount.total,
        company: pjCount.total,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchClients(activeTab, search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeTab, fetchClients]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    fetchClients(activeTab, search, newPage);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await ClientsService.delete(confirmDelete._id);
      setConfirmDelete(null);
      fetchClients(activeTab, search, page);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Falha ao excluir cliente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-4 py-3 md:px-10 md:py-6 border-b border-gray-100 flex flex-col gap-3 md:gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Clientes</h1>

          <div className="max-w-md flex-1 hidden md:block ml-4">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail..."
              leftIcon={<Search className="h-4 w-4" />}
              inputSize="sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMobileSearch((v) => !v); if (mobileSearch) setSearch(''); }}
              className={`md:hidden p-2 rounded-lg border transition-colors ${mobileSearch
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
            >
              <Search size={18} />
            </button>

            <Link
              href="/clientes/novo"
              className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} />
              Novo cliente
            </Link>
          </div>
        </div>

        {/* Busca expandida — mobile */}
        {mobileSearch && (
          <div className="md:hidden">
            <Input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Tabs */}
        <nav className="flex gap-5 sm:gap-8 -mb-3 md:-mb-6 border-t border-gray-100 pt-3 md:pt-4 overflow-x-auto no-scrollbar pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`border-b-2 pb-4 text-sm font-semibold px-1 whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 font-medium'
                  }`}
              >
                {tab.label}
                {(counts[tab.key] ?? 0) > 0 && (
                  <span className={`py-0.5 px-2 rounded-full text-[10px] font-bold ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {counts[tab.key]}
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
            <Spinner size={32} />
            <p className="text-sm">Carregando clientes...</p>
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <Alert variant="error">
            {error}
            <button
              onClick={() => fetchClients(activeTab, search, page)}
              className="ml-auto text-red-700 underline text-xs font-medium"
            >
              Tentar novamente
            </button>
          </Alert>
        )}

        {/* Estado vazio */}
        {!loading && !error && clients.length === 0 && (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="Nenhum cliente encontrado"
            action={
              <Link href="/clientes/novo" className="text-sm text-indigo-600 font-medium hover:underline">
                Adicionar primeiro cliente
              </Link>
            }
          />
        )}

        {/* Conteúdo */}
        {!loading && !error && clients.length > 0 && (
          <>
            {/* Lista */}
            <div className="flex flex-col gap-3 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {clients.map((client) => {
                const style = TYPE_STYLE[client.type];

                return (
                  <div
                    key={client._id}
                    className="relative bg-white p-4 sm:p-5 rounded-2xl transition-all flex items-center gap-4 sm:gap-5 group cursor-pointer border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-400"
                    onClick={() => router.push(`/clientes/${client._id}`)}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-[15px] truncate">{client.name}</h3>
                      <p className="text-[13px] font-medium text-gray-500 mt-0.5 truncate">{getContactInfo(client)}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md inline-flex ${style.badge}`}>
                      {style.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === client._id ? null : client._id);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === client._id && (
                      <div className="absolute top-2 right-12 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[150px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            router.push(`/clientes/${client._id}`);
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
                            setConfirmDelete(client);
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

              {/* Card "Novo cliente" */}
              <Link
                href="/clientes/novo"
                className="border-2 border-dashed border-gray-200 rounded-xl min-h-[80px] flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all gap-3 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110">
                  <Plus size={20} className="group-hover:text-indigo-600 transition-colors" />
                </div>
                <span className="text-sm font-semibold">Novo cliente</span>
              </Link>
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
          href="/clientes/novo"
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
                <h3 className="text-base font-bold text-gray-900">Excluir cliente?</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Tem certeza que deseja excluir{' '}
                  <span className="font-semibold text-gray-700">&quot;{confirmDelete.name}&quot;</span>?
                  {' '}Esta ação não pode ser desfeita.
                </p>
              </div>

              {deleteError && (
                <Alert variant="error">{deleteError}</Alert>
              )}

              <div className="flex gap-3 mt-1">
                <Button
                  variant="outline"
                  fullWidth
                  disabled={deleting}
                  onClick={() => { setConfirmDelete(null); setDeleteError(''); }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  loading={deleting}
                  onClick={handleDeleteConfirm}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
