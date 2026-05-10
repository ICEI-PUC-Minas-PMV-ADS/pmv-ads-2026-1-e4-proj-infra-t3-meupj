'use client';

import Link from 'next/link';
import { Search, Plus, Filter, User, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type PersonType } from '@/services/clients.service';
import { useClients } from '@/contexts/clients.context';

export default function ClientesPage() {
  const { clients, total, loading, error, fetchClients } = useClients();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PersonType | ''>('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchClients({
      page,
      limit,
      q: search || undefined,
      type: filterType || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }, [page, search, filterType, fetchClients]);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, filterType]);

  const getTypeBadge = (type: PersonType) => {
    if (type === 'individual') {
      return { label: 'PF', color: 'text-indigo-700', bg: 'bg-indigo-50' };
    }
    return { label: 'PJ', color: 'text-amber-800', bg: 'bg-amber-100/50' };
  };

  const getContactInfo = (client: { phone?: string; email?: string }) => {
    const parts: string[] = [];
    if (client.phone) parts.push(client.phone);
    if (client.email) parts.push(client.email);
    return parts.join(' · ') || '—';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-6 py-6 md:px-10 border-b border-gray-100 flex flex-col gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clientes</h1>
            <div className="relative max-w-md flex-1 hidden md:block ml-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-500 font-medium text-gray-800"
                placeholder="Buscar por nome, e-mail..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`p-2 border rounded-lg transition-colors flex items-center gap-2 ${filterType ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Filter size={18} />
                <span className="text-sm font-medium hidden sm:inline">
                  {filterType === 'individual' ? 'PF' : filterType === 'company' ? 'PJ' : 'Filtrar'}
                </span>
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => { setFilterType(''); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${!filterType ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => { setFilterType('individual'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${filterType === 'individual' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}
                  >
                    Pessoa Física
                  </button>
                  <button
                    onClick={() => { setFilterType('company'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${filterType === 'company' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}
                  >
                    Pessoa Jurídica
                  </button>
                </div>
              )}
            </div>
            <Link href="/clientes/novo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
              <Plus size={18} />
              <span className="hidden sm:inline">Novo cliente</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30 overflow-y-auto">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
            <div className="text-red-400">
              <Users size={48} strokeWidth={1} />
            </div>
            <p className="text-base font-semibold text-gray-600">{error}</p>
            <button
              onClick={() => fetchClients({ page, limit, q: search || undefined, type: filterType || undefined, sortBy: 'createdAt', sortOrder: 'desc' })}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
            <div className="text-gray-300">
              <Users size={48} strokeWidth={1} />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-600">
                {search || filterType ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search || filterType ? 'Tente alterar os filtros de busca.' : 'Comece adicionando seu primeiro cliente.'}
              </p>
            </div>
            {!search && !filterType && (
              <Link href="/clientes/novo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2 active:scale-95 mt-2">
                <Plus size={18} />
                Novo cliente
              </Link>
            )}
          </div>
        )}

        {/* Client List */}
        {!loading && !error && clients.length > 0 && (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {clients.map((client) => {
              const badge = getTypeBadge(client.type);
              return (
                <div key={client._id} className="bg-white p-4 sm:p-5 rounded-2xl transition-all flex items-center gap-4 sm:gap-5 group cursor-pointer border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-400">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-[15px] truncate">{client.name}</h3>
                    <p className="text-[13px] font-medium text-gray-500 mt-0.5 truncate">{getContactInfo(client)}</p>
                  </div>
                  <div className="text-right flex items-center justify-end">
                    <span className={`text-[11px] font-bold ${badge.color} ${badge.bg} px-3 py-1.5 rounded-md inline-flex`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                <span className="text-sm font-medium text-gray-500 px-3">
                  {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Próximo
                </button>
              </div>
            )}

            {/* Mobile FAB */}
            <Link href="/clientes/novo" className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40">
              <Plus size={24} />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
