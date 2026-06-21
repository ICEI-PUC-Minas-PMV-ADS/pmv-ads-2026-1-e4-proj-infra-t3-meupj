'use client';

import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionsService, type PaymentMethod } from '@/services/transactions.service';
import { OrdersService, type Order } from '@/services/orders.service';
import { Toast } from '@/components/ui/Feedback';

interface ToastState {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'warning';
}

export default function NovoLancamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  
  // Form States
  const [tipo, setTipo] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'pending' | 'confirmed'>('confirmed');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch orders for the linked order dropdown
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await OrdersService.list();
        setOrders(response.data || []);
      } catch (err) {
        console.error('Falha ao carregar pedidos:', err);
      }
    }
    fetchOrders();
  }, []);

  const addToast = (message: string, variant: 'success' | 'error' | 'warning') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const submitTransaction = async () => {
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0) {
      addToast('Por favor, insira um valor válido.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(amount.replace(',', '.')),
        transactionDate: new Date(transactionDate).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        paymentMethod: paymentMethod || undefined,
        category: category || undefined,
        reference: reference || undefined,
        notes: notes || undefined,
        orderId: orderId || undefined,
        status: status,
      };

      const transaction = await TransactionsService.create(tipo, payload);
      
      if (status === 'confirmed' && transaction.status !== 'confirmed') {
        await TransactionsService.confirm(transaction._id);
      }
      router.replace('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
      addToast(err instanceof Error ? err.message : 'Ocorreu um erro ao salvar o lançamento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitTransaction();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            variant={toast.variant}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Header Form */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Novo Lançamento</h1>
        </div>
      </div>

      <form id="transaction-form" onSubmit={handleSubmit} className="contents">
        <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
          <div className="flex flex-col gap-8">
          
          {/* Tipo */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl h-[48px]">
            <button 
              type="button"
              onClick={() => setTipo('income')}
              className={`flex-1 text-sm font-semibold rounded-lg transition-all ${tipo === 'income' ? 'bg-white text-emerald-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
            >
              Receita
            </button>
            <button 
              type="button"
              onClick={() => setTipo('expense')}
              className={`flex-1 text-sm font-semibold rounded-lg transition-all ${tipo === 'expense' ? 'bg-white text-red-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
            >
              Custo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-[2]">
              <label className="text-sm font-medium text-gray-700">Valor <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-900 font-semibold">R$</span>
                </div>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white font-bold text-gray-900 text-lg" 
                  placeholder="0,00" 
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="relative">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pending' | 'confirmed')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700 h-[48px]"
                >
                  <option value="confirmed">Confirmado / Pago</option>
                  <option value="pending">Pendente</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Data</label>
              <input 
                type="date" 
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white text-gray-700" 
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Vencimento</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white text-gray-700" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Pedido vinculado <span className="text-gray-400 font-normal">(opcional)</span></label>
            <div className="relative">
              <select 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer h-[48px] ${!orderId ? 'text-gray-400' : 'text-gray-700'}`}
              >
                <option value="">Selecione um pedido...</option>
                {orders.map(order => (
                  <option key={order._id} value={order._id}>
                    {order.orderNumber} {order.reference ? `- ${order.reference}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700 h-[48px]"
                >
                  <option value="">Selecione...</option>
                  <option value="servicos">Serviços prestados</option>
                  <option value="produtos">Venda de produtos</option>
                  <option value="impostos">Impostos</option>
                  <option value="operacional">Custo operacional</option>
                  <option value="infraestrutura">Infraestrutura</option>
                  <option value="outros">Outros</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Meio pgto.</label>
              <div className="relative">
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700 h-[48px]"
                >
                  <option value="">Selecione...</option>
                  <option value="pix">Pix</option>
                  <option value="bankSlip">Boleto</option>
                  <option value="creditCard">Cartão de Crédito</option>
                  <option value="debitCard">Cartão de Débito</option>
                  <option value="bankTransfer">Transferência bancária</option>
                  <option value="cash">Dinheiro</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Referência</label>
            <input 
              type="text" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white text-gray-700 font-medium" 
              placeholder="Ex: NF 1234, parcela 2/3" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Observações</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white text-gray-700 font-medium resize-none" 
              placeholder="Alguma nota adicional sobre este lançamento..." 
            />
          </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-0 left-0 md:left-[72px] right-0 z-30 pb-safe">
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95">
            Cancelar
          </Link>
          <button 
            type="button"
            onClick={() => void submitTransaction()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Salvar lançamento
          </button>
        </div>
      </form>
    </div>
  );
}
