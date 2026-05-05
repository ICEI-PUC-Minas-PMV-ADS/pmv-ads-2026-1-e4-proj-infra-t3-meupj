'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';
import { z } from 'zod';
import { type OrderStatus, type PaymentMethod } from '@/services/orders.service';
import { Button, Input, Select, Textarea, Alert, Badge } from '@/components/ui';

// ─── Schema ───────────────────────────────────────────────────────────────────

const orderSchema = z.object({
  clientId: z.string().optional().nullable(),
  status: z.enum(['draft', 'pendingApproval', 'inProgress', 'completed', 'warranty', 'cancelled']),
  reference: z.string().optional(),
  paymentMethods: z.array(z.string()).optional(),
  paymentTerms: z.string().optional(),
  discount: z.number().min(0).optional(),
  fees: z.number().min(0).optional(),
  items: z.array(z.object({
    catalogItemId: z.string().min(1, 'Selecione um item do catálogo'),
    quantity: z.number().min(1, 'Mínimo 1'),
  })).min(1, 'Adicione pelo menos um item ao pedido.'),
});

interface LineItem {
  id: number;
  catalogItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const MOCK_CATALOG = [
  { id: 'cat-1', name: 'Serviço de Instalação', unitPrice: 250 },
  { id: 'cat-2', name: 'Mão de obra (hora)',    unitPrice: 80  },
  { id: 'cat-3', name: 'Material elétrico (kit)', unitPrice: 450 },
  { id: 'cat-4', name: 'Consultoria técnica',   unitPrice: 350 },
];

const MOCK_CLIENTS = [
  { id: 'cli-1', name: 'João Ferreira' },
  { id: 'cli-2', name: 'Ana Silveira' },
  { id: 'cli-3', name: 'Construtora Mota Ltda.' },
];

// TODO: Substituir por OrdersService.getById(id)
const MOCK_ORDERS: Record<string, any> = {
  '1': { orderNumber: 'PED-0004-2026', clientId: 'cli-1', status: 'inProgress',      reference: '',          paymentMethods: ['pix'],          paymentTerms: '50% na entrega', discount: 0,  fees: 0,   items: [{ id: 1, catalogItemId: 'cat-1', name: 'Serviço de Instalação', quantity: 2, unitPrice: 250 }, { id: 2, catalogItemId: 'cat-2', name: 'Mão de obra (hora)', quantity: 3, unitPrice: 80 }] },
  '2': { orderNumber: 'PED-0003-2026', clientId: 'cli-2', status: 'pendingApproval', reference: 'OS-2026-003', paymentMethods: ['creditCard'],  paymentTerms: '',               discount: 50, fees: 0,   items: [{ id: 1, catalogItemId: 'cat-3', name: 'Material elétrico (kit)', quantity: 1, unitPrice: 450 }] },
  '3': { orderNumber: 'PED-0002-2026', clientId: 'cli-3', status: 'completed',       reference: '',          paymentMethods: ['cash'],          paymentTerms: 'À vista',        discount: 0,  fees: 0,   items: [{ id: 1, catalogItemId: 'cat-4', name: 'Consultoria técnica', quantity: 1, unitPrice: 350 }] },
  '4': { orderNumber: 'PED-0001-2026', clientId: '',      status: 'draft',           reference: '',          paymentMethods: [],               paymentTerms: '',               discount: 0,  fees: 0,   items: [{ id: 1, catalogItemId: '', name: '', quantity: 1, unitPrice: 0 }] },
  '5': { orderNumber: 'PED-0005-2026', clientId: 'cli-1', status: 'cancelled',       reference: '',          paymentMethods: ['pix'],          paymentTerms: '',               discount: 0,  fees: 0,   items: [{ id: 1, catalogItemId: 'cat-2', name: 'Mão de obra (hora)', quantity: 4, unitPrice: 80 }] },
  '6': { orderNumber: 'PED-0006-2026', clientId: 'cli-3', status: 'warranty',        reference: 'GAR-001',   paymentMethods: ['bankTransfer'], paymentTerms: '',               discount: 0,  fees: 100, items: [{ id: 1, catalogItemId: 'cat-1', name: 'Serviço de Instalação', quantity: 6, unitPrice: 250 }, { id: 2, catalogItemId: 'cat-3', name: 'Material elétrico (kit)', quantity: 2, unitPrice: 450 }] },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Rascunho', pendingApproval: 'Aguard. aprovação',
  inProgress: 'Em andamento', completed: 'Concluído',
  warranty: 'Garantia', cancelled: 'Cancelado',
};

const STATUS_BADGE: Record<OrderStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  draft:           'default',
  pendingApproval: 'warning',
  inProgress:      'info',
  completed:       'success',
  warranty:        'default',
  cancelled:       'danger',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix', cash: 'Dinheiro', creditCard: 'Cartão de Crédito',
  debitCard: 'Cartão de Débito', bankTransfer: 'Transferência Bancária', bankSlip: 'Boleto',
};

const STATUS_OPTIONS = [
  { value: 'draft',           label: 'Rascunho' },
  { value: 'pendingApproval', label: 'Aguardando aprovação' },
  { value: 'inProgress',      label: 'Em andamento' },
  { value: 'completed',       label: 'Concluído' },
  { value: 'warranty',        label: 'Garantia' },
  { value: 'cancelled',       label: 'Cancelado' },
];

function formatCurrency(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const mockOrder = MOCK_ORDERS[id]; // TODO: substituir por API

  const [clientId,       setClientId]       = useState(mockOrder?.clientId ?? '');
  const [status,         setStatus]         = useState<OrderStatus>(mockOrder?.status ?? 'draft');
  const [reference,      setReference]      = useState(mockOrder?.reference ?? '');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockOrder?.paymentMethods ?? []);
  const [paymentTerms,   setPaymentTerms]   = useState(mockOrder?.paymentTerms ?? '');
  const [discount,       setDiscount]       = useState(mockOrder?.discount ?? 0);
  const [fees,           setFees]           = useState(mockOrder?.fees ?? 0);
  const [items,          setItems]          = useState<LineItem[]>(
    mockOrder?.items ?? [{ id: Date.now(), catalogItemId: '', name: '', quantity: 1, unitPrice: 0 }]
  );

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total    = subtotal - discount + fees;

  if (!mockOrder) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-4 text-gray-400">
        <p className="font-medium">Pedido não encontrado</p>
        <Link href="/pedidos" className="text-indigo-600 text-sm font-medium hover:underline">
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  const addItem = () =>
    setItems((p) => [...p, { id: Date.now(), catalogItemId: '', name: '', quantity: 1, unitPrice: 0 }]);

  const removeItem = (itemId: number) =>
    setItems((p) => p.filter((i) => i.id !== itemId));

  const updateItemCatalog = (itemId: number, catalogItemId: string) => {
    const cat = MOCK_CATALOG.find((c) => c.id === catalogItemId);
    setItems((p) =>
      p.map((i) =>
        i.id === itemId ? { ...i, catalogItemId, name: cat?.name ?? '', unitPrice: cat?.unitPrice ?? 0 } : i
      )
    );
  };

  const updateItemQty = (itemId: number, quantity: number) =>
    setItems((p) => p.map((i) => (i.id === itemId ? { ...i, quantity } : i)));

  const togglePaymentMethod = (method: PaymentMethod) =>
    setPaymentMethods((p) =>
      p.includes(method) ? p.filter((m) => m !== method) : [...p, method]
    );

  const handleSave = useCallback(async () => {
    setError('');
    setSuccess(false);

    const payload = {
      clientId: clientId || null,
      status,
      reference:      reference || undefined,
      paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined,
      paymentTerms:   paymentTerms || undefined,
      discount:       discount > 0 ? discount : undefined,
      fees:           fees > 0 ? fees : undefined,
      items:          items.map((i) => ({ catalogItemId: i.catalogItemId, quantity: i.quantity })),
    };

    const validation = orderSchema.safeParse(payload);
    if (!validation.success) { setError(validation.error.issues[0].message); return; }

    try {
      setLoading(true);
      // TODO: await OrdersService.update(id, validation.data);
      await new Promise((r) => setTimeout(r, 700));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar pedido.');
    } finally {
      setLoading(false);
    }
  }, [id, clientId, status, reference, paymentMethods, paymentTerms, discount, fees, items]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      setLoading(true);
      // TODO: await OrdersService.delete(id);
      await new Promise((r) => setTimeout(r, 500));
      router.push('/pedidos');
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir pedido.');
      setLoading(false);
    }
  }, [id, router]);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/pedidos"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-gray-900 tracking-wide">{mockOrder.orderNumber}</h1>
            <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}
          className="text-red-500 hover:bg-red-50 hover:text-red-600">
          <Trash2 size={15} />
          <span className="hidden sm:inline">Excluir</span>
        </Button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 p-4 md:p-10 max-w-4xl mx-auto w-full overflow-y-auto pb-48 md:pb-32">

        {error   && <Alert variant="error"   className="mb-6">{error}</Alert>}
        {success && <Alert variant="success" className="mb-6">Pedido atualizado com sucesso!</Alert>}

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
                {MOCK_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                options={STATUS_OPTIONS}
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

          {/* ── Itens ── */}
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
                      {MOCK_CATALOG.map((c) => (
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        active
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
          variant="primary"
          loading={loading}
          onClick={handleSave}
          fullWidth={false}
          className="w-full sm:w-auto"
        >
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
