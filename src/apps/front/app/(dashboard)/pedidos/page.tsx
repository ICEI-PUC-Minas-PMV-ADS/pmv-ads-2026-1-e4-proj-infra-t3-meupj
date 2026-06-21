'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, FileText, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Order, type OrderStatus } from '@/services/orders.service';
import { useOrders } from '@/contexts/orders.context';
import { Alert, Badge, Spinner, EmptyState } from '@/components/ui';

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Rascunho',
  pendingApproval: 'Aguard. aprovação',
  inProgress: 'Em andamento',
  completed: 'Concluído',
  warranty: 'Garantia',
  cancelled: 'Cancelado',
};

const STATUS_STYLE: Record<OrderStatus, { dot: string; badge: string }> = {
  draft: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
  pendingApproval: { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
  inProgress: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  completed: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  warranty: { dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700' },
  cancelled: { dot: 'bg-red-400', badge: 'bg-red-50 text-red-600' },
};

const STATUS_BADGE: Record<OrderStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  draft: 'default',
  pendingApproval: 'warning',
  inProgress: 'info',
  completed: 'success',
  warranty: 'default',
  cancelled: 'danger',
};

type TabKey = 'all' | OrderStatus;
type OrderDocumentAction = 'budget' | 'serviceOrder';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'draft', label: 'Rascunho' },
  { key: 'pendingApproval', label: 'Aguard. aprovação' },
  { key: 'inProgress', label: 'Em andamento' },
  { key: 'completed', label: 'Concluído' },
  { key: 'warranty', label: 'Garantia' },
  { key: 'cancelled', label: 'Cancelado' },
];

const canEmitBudget = (order: Order): boolean => order.status !== 'cancelled';

const canEmitServiceOrder = (order: Order): boolean =>
  order.status === 'inProgress' || order.status === 'completed' || order.status === 'warranty';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function PedidosPage() {
  const router = useRouter();
  const { orders, loading, error, fetchOrders } = useOrders();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [mobileSearch, setMobileSearch] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openingDocumentKey, setOpeningDocumentKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders({
        status: activeTab !== 'all' ? (activeTab as OrderStatus) : undefined,
        q: search.trim() || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeTab, fetchOrders]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handleOpenOrder = (orderId: string) => {
    router.push(`/pedidos/${orderId}`);
  };

  const handleDocumentAction = (orderId: string, action: OrderDocumentAction) => {
    const actionKey = `${action}:${orderId}`;
    setOpeningDocumentKey(actionKey);
    setOpenMenuId(null);

    const path =
      action === 'budget'
        ? `/documentos/orcamento/${orderId}`
        : `/documentos/ordem-servico/${orderId}`;

    router.push(path);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-4 py-3 md:px-10 md:py-6 border-b border-gray-100 flex flex-col gap-3 md:gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Pedidos</h1>

          <div className="relative max-w-md flex-1 hidden md:block ml-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-500 font-medium text-gray-800"
              placeholder="Busque por número, item..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileSearch((value) => !value);
                if (mobileSearch) {
                  setSearch('');
                }
              }}
              className={`md:hidden p-2 rounded-lg border transition-colors ${
                mobileSearch
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Search size={18} />
            </button>
            <Link
              href="/pedidos/novo"
              className="hidden md:flex bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 items-center justify-center gap-2 active:scale-95"
            >
              <Plus size={18} />
              Novo pedido
            </Link>
          </div>
        </div>

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
              placeholder="Busque por número ou cliente..."
            />
          </div>
        )}

        <nav className="flex gap-5 sm:gap-8 -mb-3 md:-mb-6 border-t border-gray-100 pt-3 md:pt-4 overflow-x-auto no-scrollbar pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
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
              </button>
            );
          })}
        </nav>
      </header>

      {openMenuId && <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />}

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30 overflow-y-auto">
        <div className="flex flex-col gap-3 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Spinner size={32} />
              <p className="text-sm">Carregando pedidos...</p>
            </div>
          )}

          {!loading && error && <Alert variant="error">{error}</Alert>}

          {!loading && !error && orders.length === 0 && (
            <EmptyState
              icon={<FileText size={48} />}
              title="Nenhum pedido encontrado"
              description="Crie o primeiro pedido para começar."
              action={
                <Link
                  href="/pedidos/novo"
                  className="text-sm text-indigo-600 font-medium hover:underline"
                >
                  Criar primeiro pedido
                </Link>
              }
            />
          )}

          {!loading &&
            !error &&
            orders.map((order) => {
              const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.draft;
              const label = STATUS_LABELS[order.status] ?? order.status;
              const budgetActionKey = `budget:${order._id}`;
              const serviceOrderActionKey = `serviceOrder:${order._id}`;

              return (
                <div
                  key={order._id}
                  className="bg-white p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 group cursor-pointer relative overflow-visible border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                  onClick={() => handleOpenOrder(order._id)}
                >
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full ${style.dot} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />

                  <div className="flex-1 min-w-0 flex flex-col pl-2 sm:pl-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`} />
                      <h3 className="font-bold text-gray-900 text-[15px]">{order.orderNumber}</h3>
                      <Badge variant={STATUS_BADGE[order.status] ?? 'default'}>{label}</Badge>
                    </div>
                    <p className="text-[13px] font-medium text-gray-500 mt-1 pl-4 sm:pl-5 truncate">
                      {order.clientName ?? order.clientId ?? '— sem cliente —'}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-2 sm:pl-0 mt-2 sm:mt-0 gap-3 sm:gap-2">
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                      <span className="text-[15px] font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                      <span className="text-[12px] font-medium text-gray-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((currentId) =>
                            currentId === order._id ? null : order._id,
                          );
                        }}
                        className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                        aria-label={`Abrir ações do pedido ${order.orderNumber}`}
                        title={`Abrir ações do pedido ${order.orderNumber}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === order._id && (
                        <div
                          className="absolute right-0 top-11 z-40 min-w-[220px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleOpenOrder(order._id);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Abrir pedido
                          </button>

                          {canEmitBudget(order) && (
                            <button
                              type="button"
                              disabled={openingDocumentKey === budgetActionKey}
                              onClick={() => handleDocumentAction(order._id, 'budget')}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                              {openingDocumentKey === budgetActionKey
                                ? 'Abrindo orçamento...'
                                : 'Emitir orçamento'}
                            </button>
                          )}

                          {canEmitServiceOrder(order) && (
                            <button
                              type="button"
                              disabled={openingDocumentKey === serviceOrderActionKey}
                              onClick={() => handleDocumentAction(order._id, 'serviceOrder')}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                              {openingDocumentKey === serviceOrderActionKey
                                ? 'Abrindo ordem de serviço...'
                                : 'Emitir ordem de serviço'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          <Link
            href="/pedidos/novo"
            aria-label="Novo pedido"
            title="Novo pedido"
            className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40"
          >
            <Plus size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
}
