'use client';

import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  OrdersService,
  type OrderStatus,
  type PaymentMethod,
} from '@/services/orders.service';
import { Button, Input, Select, Textarea, Alert } from '@/components/ui';
import { useClients } from '@/contexts/clients.context';
import { useCatalog } from '@/contexts/catalog.context';

// ─── Schemas & Types ──────────────────────────────────────────────────────────

const orderSchema = z.object({
  clientId: z.string().optional().nullable(),
  status: z.enum(['draft', 'pendingApproval', 'inProgress', 'completed', 'warranty', 'cancelled']),
  reference: z.string().optional(),
  paymentMethods: z.array(z.enum(['pix', 'cash', 'creditCard', 'debitCard', 'bankTransfer', 'bankSlip'])).optional(),
  paymentTerms: z.string().optional(),
  discount: z.number().min(0).optional(),
  fees: z.number().min(0).optional(),
  items: z.array(
    z.object({
      catalogItemId: z.string().min(1, 'Selecione um item do catálogo'),
      quantity: z.number('Qtd. inválida').min(1, 'Mínimo 1'),
    })
  ).min(1, 'Adicione pelo menos um item ao pedido.'),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface LineItem {
  id: number;
  catalogItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cash: 'Dinheiro',
  creditCard: 'Cartão de Crédito',
  debitCard: 'Cartão de Débito',
  bankTransfer: 'Transferência Bancária',
  bankSlip: 'Boleto',
};

function formatCurrency(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}



// ─── Component ────────────────────────────────────────────────────────────────

export default function NovoPedidoPage() {
  const router = useRouter();
  const { clientOptions, loadClientOptions } = useClients();
  const { catalogOptions, loadCatalogOptions } = useCatalog();

  useEffect(() => {
    loadClientOptions();
    loadCatalogOptions();
  }, [loadClientOptions, loadCatalogOptions]);

  // Form state
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<OrderStatus>('draft');
  const [reference, setReference] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [discount, setDiscount] = useState(0);
  const [fees, setFees] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: Date.now(), catalogItemId: '', name: '', quantity: 1, unitPrice: 0 },
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Computed totals ────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = subtotal - discount + fees;

  // ─── Item helpers ───────────────────────────────────────────────────────────
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now(), catalogItemId: '', name: '', quantity: 1, unitPrice: 0 },
    ]);

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItemCatalog = (id: number, catalogItemId: string) => {
    const catalog = catalogOptions.find((c) => c.id === catalogItemId);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, catalogItemId, name: catalog?.name ?? '', unitPrice: catalog?.unitPrice ?? 0 }
          : i,
      ),
    );
  };

  const updateItemQty = (id: number, quantity: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));

  // ─── Payment method toggle ───────────────────────────────────────────────────
  const togglePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (targetStatus: OrderStatus) => {
    setError('');

    const payload = {
      clientId: clientId || null,
      status: targetStatus,
      reference: reference || undefined,
      paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined,
      paymentTerms: paymentTerms || undefined,
      discount: discount > 0 ? discount : undefined,
      fees: fees > 0 ? fees : undefined,
      items: items.map((i) => ({ catalogItemId: i.catalogItemId, quantity: i.quantity })),
    };

    const validation = orderSchema.safeParse(payload);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      await OrdersService.create(validation.data);
      router.push('/pedidos');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [clientId, status, reference, paymentMethods, paymentTerms, discount, fees, items, router]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center sticky top-0 z-20">
        <Link
          href="/pedidos"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mr-3"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold text-gray-500 tracking-widest uppercase">Novo Pedido</h1>
      </div>

      <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full overflow-y-auto pb-48 md:pb-32">

        {error && <Alert variant="error" className="mb-6">{error}</Alert>}

        <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>

          {/* ── Dados Gerais ── */}
          <section className="flex flex-col gap-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Dados Gerais</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                label="Cliente"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loading}
              >
                <option value="">— Sem cliente —</option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>

              <Select
                label="Status inicial"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                options={[
                  { value: 'draft', label: 'Rascunho' },
                  { value: 'pendingApproval', label: 'Aguardando aprovação' },
                  { value: 'inProgress', label: 'Em andamento' },
                ]}
                disabled={loading}
              />
            </div>

            <Input
              label="Referência (opcional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: OS-2026-001"
              disabled={loading}
            />
          </section>

          {/* ── Itens do Pedido ── */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Itens do Pedido</h2>
            </div>

            {/* Cabeçalho desktop */}
            <div className="hidden sm:flex items-center gap-4 px-1">
              <div className="flex-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Item do Catálogo</div>
              <div className="w-24 text-[10px] font-bold tracking-widest text-gray-400 uppercase text-center">Qtd</div>
              <div className="w-28 text-[10px] font-bold tracking-widest text-gray-400 uppercase text-right">Preço unit.</div>
              <div className="w-8" />
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4">

                  <div className="flex flex-col gap-1 flex-1 w-full">
                    <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase">Item do Catálogo</label>
                    <Select
                      value={item.catalogItemId}
                      onChange={(e) => updateItemCatalog(item.id, e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Selecione um item...</option>
                      {catalogOptions.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1 w-24">
                    <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase">Qtd</label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                      className="text-center"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-28">
                    <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase">Preço unit.</label>
                    <Input
                      value={item.catalogItemId ? formatCurrency(item.unitPrice) : ''}
                      readOnlyStyle
                      className="text-right"
                      placeholder="—"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1 || loading}
                    className="flex w-8 h-8 items-center justify-center text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20 disabled:cursor-not-allowed mb-0.5"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={loading}
              className="w-full py-3.5 border border-dashed border-indigo-200 rounded-lg text-indigo-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-indigo-50/50 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />Adicionar item do catálogo
            </button>

            {/* Totais */}
            <div className="flex flex-col items-end gap-3 mt-4 w-full">
              <div className="flex justify-between items-center w-full sm:w-72">
                <span className="text-gray-500 text-sm font-medium">Subtotal</span>
                <span className="text-gray-900 font-medium text-sm">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center w-full sm:w-72">
                <span className="text-gray-500 text-sm font-medium">Desconto</span>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 text-right"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-between items-center w-full sm:w-72">
                <span className="text-gray-500 text-sm font-medium">Taxa / Frete</span>
                <Input
                  type="number"
                  min={0}
                  value={fees}
                  onChange={(e) => setFees(Number(e.target.value))}
                  className="w-28 text-right"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-between items-center w-full sm:w-72 pt-3 border-t border-gray-100">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-indigo-600 font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </section>

          {/* ── Pagamento ── */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Pagamento</h2>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Meios aceitos</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => {
                  const active = paymentMethods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => togglePaymentMethod(method)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${active
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                    >
                      {PAYMENT_METHOD_LABELS[method]}
                    </button>
                  );
                })}
              </div>
            </div>

            <Textarea
              label="Condições / Observações (opcional)"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
              placeholder="Ex: 50% na aprovação, restante na entrega"
              disabled={loading}
            />
          </section>
        </form>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-gray-100 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 fixed bottom-16 md:bottom-0 left-0 md:left-[72px] right-0 z-30">
        <Link
          href="/pedidos"
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all text-center"
        >
          Cancelar
        </Link>
        <Button
          variant="secondary"
          loading={loading}
          onClick={() => handleSubmit('draft')}
          className="w-full sm:w-auto"
        >
          Salvar rascunho
        </Button>
        <Button
          variant="primary"
          loading={loading}
          onClick={() => handleSubmit(status)}
          className="w-full sm:w-auto"
        >
          Criar pedido
        </Button>
      </div>
    </div>
  );
}

