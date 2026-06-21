'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, Loader2, MoreVertical } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
  TransactionsService,
  type Transaction,
  type TransactionListQuery,
} from '@/services/transactions.service';

type TransactionDocumentAction = 'receipt';

const canEmitReceipt = (transaction: Transaction): boolean => transaction.status === 'confirmed';

export default function FinanceiroPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<'month' | 'all'>('month');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openingDocumentKey, setOpeningDocumentKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);

        const query: TransactionListQuery = {};

        if (dateRange === 'month') {
          const now = new Date();
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const lastDay = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
          ).toISOString();
          query.transactionFrom = firstDay;
          query.transactionTo = lastDay;
        }

        const response = await TransactionsService.list(query);
        setTransactions(response.data || []);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    void loadTransactions();
  }, [dateRange]);

  const kpis = useMemo(() => {
    const confirmedIncome = transactions
      .filter((tx) => tx.type === 'income' && tx.status === 'confirmed')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const pendingIncome = transactions
      .filter(
        (tx) => tx.type === 'income' && tx.status === 'pending' && tx.displayStatus !== 'overdue',
      )
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const overdueIncome = transactions
      .filter((tx) => tx.type === 'income' && tx.displayStatus === 'overdue')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const confirmedExpenses = transactions
      .filter((tx) => tx.type === 'expense' && tx.status === 'confirmed')
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    return {
      confirmedIncome,
      pendingIncome,
      overdueIncome,
      confirmedExpenses,
      result: confirmedIncome - confirmedExpenses,
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const segments = Math.ceil(daysInMonth / 7);

    const incomeBySegment = Array(segments).fill(0);
    const expenseBySegment = Array(segments).fill(0);

    const currentMonthTransactions = transactions.filter((tx) => {
      const date = new Date(tx.transactionDate);
      return (
        tx.status === 'confirmed' &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    currentMonthTransactions.forEach((tx) => {
      const day = new Date(tx.transactionDate).getDate();
      const segmentIndex = Math.min(Math.floor((day - 1) / 7), segments - 1);
      if (tx.type === 'income') {
        incomeBySegment[segmentIndex] += Number(tx.amount) || 0;
      } else {
        expenseBySegment[segmentIndex] += Number(tx.amount) || 0;
      }
    });

    const maxVal = Math.max(...incomeBySegment, ...expenseBySegment, 1);

    return incomeBySegment.map((income, index) => ({
      week: index + 1,
      income: {
        height: Math.max((income / maxVal) * 100, 4),
        value: income,
      },
      expense: {
        height: Math.max((expenseBySegment[index] / maxVal) * 100, 4),
        value: expenseBySegment[index],
      },
    }));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
  };

  const handleOpenTransaction = (transactionId: string) => {
    router.push(`/dashboard/editar/${transactionId}`);
  };

  const handleDocumentAction = (transactionId: string, action: TransactionDocumentAction) => {
    const actionKey = `${action}:${transactionId}`;
    setOpeningDocumentKey(actionKey);
    setOpenMenuId(null);
    router.push(`/documentos/recibo/${transactionId}`);
  };

  return (
    <div className="flex flex-col min-h-full bg-white">
      <header className="px-6 py-6 md:px-10 border-b border-gray-100 flex flex-col gap-6 relative md:sticky md:top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financeiro</h1>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'month' | 'all')}
                className="flex px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors items-center gap-2 text-sm font-medium appearance-none cursor-pointer pr-10"
              >
                <option value="month">Este mês</option>
                <option value="all">Sempre</option>
              </select>
              <ChevronDown
                size={16}
                className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-1 md:mt-2">
          <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden bg-white shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Receita confirmada
            </span>
            <div className="text-emerald-700 font-bold px-0 py-1 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-lg md:text-2xl">
              {formatCurrency(kpis.confirmedIncome)}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[11px] md:text-sm font-medium text-gray-600">confirmado</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden bg-white shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              A receber
            </span>
            <div className="text-blue-700 font-bold px-0 py-1 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-lg md:text-2xl">
              {formatCurrency(kpis.pendingIncome)}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[11px] md:text-sm font-medium text-gray-600">pendente</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden bg-white shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Em atraso
            </span>
            <div className="text-red-700 font-bold px-0 py-1 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-lg md:text-2xl">
              {formatCurrency(kpis.overdueIncome)}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span className="text-[11px] md:text-sm font-medium text-gray-600">atrasado</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden bg-gray-50/50 shadow-inner">
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-500"></div>
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Resultado
            </span>
            <div
              className={`font-bold px-0 py-1 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-lg md:text-2xl ${kpis.result >= 0 ? 'text-gray-800' : 'text-red-600'}`}
            >
              {formatCurrency(kpis.result)}
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
              <span className="text-[11px] md:text-sm font-medium text-gray-500">
                receitas - custos
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-32 flex flex-col items-center justify-end pb-2 relative">
          <div className="flex items-end gap-6 sm:gap-10 h-20">
            {chartData.map((data) => (
              <div key={data.week} className="flex flex-col items-center gap-2 h-full">
                <div className="flex items-end gap-1 flex-1">
                  <div
                    title={`Receita: ${formatCurrency(data.income.value)}`}
                    className="w-2 sm:w-4 bg-emerald-500/80 rounded-t-sm transition-all duration-500 hover:bg-emerald-500"
                    style={{ height: `${data.income.height}%` }}
                  ></div>
                  <div
                    title={`Custo: ${formatCurrency(data.expense.value)}`}
                    className="w-2 sm:w-4 bg-red-400/80 rounded-t-sm transition-all duration-500 hover:bg-red-500"
                    style={{ height: `${data.expense.height}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Sem {data.week}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Receitas
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Custos
              </span>
            </div>
          </div>
        </div>

        <nav className="flex gap-8 -mb-6 border-t border-gray-100 pt-4 mt-2">
          <button
            onClick={() => setFilter('all')}
            className={`pb-4 text-sm px-1 transition-all ${filter === 'all' ? 'border-b-2 border-indigo-600 font-semibold text-indigo-600' : 'border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`pb-4 text-sm px-1 transition-all ${filter === 'income' ? 'border-b-2 border-indigo-600 font-semibold text-indigo-600' : 'border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
          >
            Receitas
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`pb-4 text-sm px-1 transition-all ${filter === 'expense' ? 'border-b-2 border-indigo-600 font-semibold text-indigo-600' : 'border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
          >
            Custos
          </button>
        </nav>
      </header>

      {openMenuId && <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />}

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30">
        <div className="flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Carregando lançamentos...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-3xl">
              <span className="text-sm font-medium">Nenhum lançamento encontrado.</span>
              <Link
                href="/dashboard/novo"
                className="text-indigo-600 text-sm font-bold hover:underline"
              >
                Criar primeiro lançamento
              </Link>
            </div>
          ) : (
            filteredTransactions.map((tx, index) => {
              const actionKey = `receipt:${tx._id}`;
              return (
                <div
                  key={tx._id}
                  onClick={() => handleOpenTransaction(tx._id)}
                  className={`relative flex items-center gap-4 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group px-2 -mx-2 rounded-xl ${index !== filteredTransactions.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 self-start sm:self-center ${
                      tx.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {tx.category
                        ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1)
                        : 'Sem categoria'}
                      {tx.reference ? ` — ${tx.reference}` : ''}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-0.5 truncate uppercase tracking-tight">
                      {tx.paymentMethod || 'N/A'} · {formatDate(tx.transactionDate)}
                    </p>
                  </div>
                  <div className="text-right flex items-center justify-end gap-3 sm:gap-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full lowercase ${
                        tx.displayStatus === 'confirmed'
                          ? 'bg-emerald-100/60 text-emerald-700'
                          : tx.displayStatus === 'overdue'
                            ? 'bg-red-100/60 text-red-700'
                            : 'bg-blue-100/60 text-blue-700'
                      }`}
                    >
                      {tx.displayStatus === 'confirmed'
                        ? 'confirmado'
                        : tx.displayStatus === 'overdue'
                          ? 'atrasado'
                          : 'pendente'}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-bold min-w-[70px] text-right ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((currentId) => (currentId === tx._id ? null : tx._id));
                        }}
                        className="w-9 h-9 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                        aria-label={`Abrir ações do lançamento ${tx.reference ?? tx._id}`}
                        title={`Abrir ações do lançamento ${tx.reference ?? tx._id}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === tx._id && (
                        <div
                          className="absolute right-0 top-11 z-40 min-w-[220px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleOpenTransaction(tx._id);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Abrir lançamento
                          </button>

                          {canEmitReceipt(tx) && (
                            <button
                              type="button"
                              disabled={openingDocumentKey === actionKey}
                              onClick={() => handleDocumentAction(tx._id, 'receipt')}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                              {openingDocumentKey === actionKey
                                ? 'Abrindo recibo...'
                                : 'Emitir recibo'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <Link
            href="/dashboard/novo"
            aria-label="Novo lançamento"
            title="Novo lançamento"
            className="fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40"
          >
            <Plus size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
}
