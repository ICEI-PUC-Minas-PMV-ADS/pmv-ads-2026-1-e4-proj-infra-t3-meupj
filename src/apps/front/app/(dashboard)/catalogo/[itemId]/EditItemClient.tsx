'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Loader2, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import { CatalogService, type CatalogUnitMeasure } from '@/services/catalog.service';
import { Alert, Button } from '@/components/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_UNITS: { value: CatalogUnitMeasure; label: string }[] = [
  { value: 'unit', label: 'Unidade (un)' },
  { value: 'dozen', label: 'Dúzia (dz)' },
  { value: 'piece', label: 'Peça (pç)' },
  { value: 'kilogram', label: 'Quilograma (kg)' },
  { value: 'meter', label: 'Metro (m)' },
  { value: 'squareMeter', label: 'Metro quadrado (m²)' },
  { value: 'box', label: 'Caixa (cx)' },
  { value: 'kit', label: 'Kit' },
];

const SERVICE_UNITS: { value: CatalogUnitMeasure; label: string }[] = [
  { value: 'hour', label: 'Hora (h)' },
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];

const TYPE_BADGE: Record<'product' | 'service', { badge: string; label: string }> = {
  product: { badge: 'bg-amber-100/50 text-amber-800', label: 'Produto' },
  service: { badge: 'bg-indigo-50 text-indigo-700', label: 'Serviço' },
};

const CHEVRON_SVG = (
  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCurrency(value: string): number {
  const cleaned = value
    .trim()
    .replace(/[^\d,.]/g, '')
    .replace(',', '.');
  return parseFloat(cleaned);
}

function toCurrencyStr(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcMargin(unitPrice: number, costPrice: number): string | null {
  if (unitPrice > 0 && costPrice > 0 && costPrice < unitPrice) {
    return (((unitPrice - costPrice) / unitPrice) * 100).toFixed(1);
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditarItemCatalogo() {
  const { itemId } = useParams<{ itemId: string }>();
  const router = useRouter();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [type, setType] = useState<'product' | 'service'>('product');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPriceStr, setUnitPriceStr] = useState('');
  const [unitMeasure, setUnitMeasure] = useState<CatalogUnitMeasure>('unit');
  const [costPriceStr, setCostPriceStr] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const unitPrice = parseCurrency(unitPriceStr);
  const costPrice = parseCurrency(costPriceStr);
  const margin = type === 'product' ? calcMargin(unitPrice, costPrice) : null;

  // Carrega o item na montagem
  useEffect(() => {
    const load = async () => {
      if (itemId === 'static') return;
      setFetchLoading(true);
      try {
        const found = await CatalogService.getById(itemId);

        setType(found.type);
        setName(found.name);
        setDescription(found.description ?? '');
        setUnitPriceStr(toCurrencyStr(found.unitPrice));
        setUnitMeasure(found.unitMeasure);
        setCostPriceStr(found.costPrice ? toCurrencyStr(found.costPrice) : '');
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
          router.replace('/login');
          return;
        }
        if (err instanceof Error && err.message === 'Item não encontrado.') {
          setNotFound(true);
          return;
        }
        setError('Falha ao carregar o item.');
      } finally {
        setFetchLoading(false);
      }
    };

    load();
  }, [itemId, router]);

  const handleTypeChange = (newType: 'product' | 'service') => {
    setType(newType);
    setUnitMeasure(newType === 'product' ? 'unit' : 'hour');
    if (newType === 'service') setCostPriceStr('');
  };

  const handleSave = useCallback(async () => {
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    const price = parseCurrency(unitPriceStr);
    if (isNaN(price) || price < 0) {
      setError('Informe um preço unitário válido (ex: 150,00).');
      return;
    }

    const cost =
      type === 'product' && costPriceStr.trim() ? parseCurrency(costPriceStr) : undefined;

    const payload = {
      type,
      name: name.trim(),
      unitPrice: price,
      unitMeasure,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(cost !== undefined && !isNaN(cost) ? { costPrice: cost } : {}),
    };

    setLoading(true);
    try {
      await CatalogService.update(itemId, payload);
      setSuccess(true);
      setTimeout(() => router.push('/catalogo'), 1500);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Falha ao salvar item.');
    } finally {
      setLoading(false);
    }
  }, [costPriceStr, description, itemId, name, router, type, unitMeasure, unitPriceStr]);

  const handleDelete = () => {
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await CatalogService.delete(itemId);
      router.push('/catalogo');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Falha ao excluir item.');
      setDeleting(false);
    }
  }, [itemId, router]);

  // ─── Estado de carregamento inicial ────────────────────────────────────────

  if (fetchLoading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-3 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm">Carregando item...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-4 text-gray-400">
        <AlertCircle className="h-10 w-10" />
        <p className="font-medium text-gray-600">Item não encontrado</p>
        <Link href="/catalogo" className="text-indigo-600 text-sm font-medium hover:underline">
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const badgeStyle = TYPE_BADGE[type];

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/catalogo"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-gray-900 tracking-wide truncate max-w-[180px] sm:max-w-xs">
              {name || 'Editar Item'}
            </h1>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full hidden sm:inline-flex ${badgeStyle.badge}`}
            >
              {badgeStyle.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-40"
        >
          <Trash2 size={15} />
          <span className="hidden sm:inline">Excluir</span>
        </button>
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
        <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>
          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Item atualizado com sucesso!</span>
            </div>
          )}

          {/* Tipo */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Tipo</h2>
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('product')}
                disabled={loading}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  type === 'product'
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                Produto
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('service')}
                disabled={loading}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  type === 'service'
                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                Serviço
              </button>
            </div>
          </section>

          {/* Dados */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Dados</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white disabled:opacity-60"
                placeholder="Ex: Consultoria, Cabo HDMI"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Descrição <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all resize-none bg-white disabled:opacity-60"
                placeholder="Descreva os detalhes do item..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">
                  Preço unitário <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">R$</span>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={unitPriceStr}
                    onChange={(e) => setUnitPriceStr(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white disabled:opacity-60"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Unidade de medida</label>
                <div className="relative">
                  <select
                    value={unitMeasure}
                    onChange={(e) => setUnitMeasure(e.target.value as CatalogUnitMeasure)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer disabled:opacity-60"
                  >
                    {(type === 'product' ? PRODUCT_UNITS : SERVICE_UNITS).map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  {CHEVRON_SVG}
                </div>
              </div>
            </div>
          </section>

          {/* Custo & Margem — apenas produtos */}
          {type === 'product' && (
            <section className="flex flex-col gap-5 animate-in fade-in duration-300">
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                Custo & Margem
                <span className="text-[10px] font-medium normal-case text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
                  (só para produtos)
                </span>
              </h2>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Custo unitário <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">R$</span>
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={costPriceStr}
                    onChange={(e) => setCostPriceStr(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white disabled:opacity-60"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 mt-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Preço de venda</span>
                  <span className="text-sm font-bold text-gray-900">
                    {!isNaN(unitPrice) && unitPrice > 0
                      ? unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'R$ —'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Custo</span>
                  <span className="text-sm font-bold text-red-500">
                    {!isNaN(costPrice) && costPrice > 0
                      ? `- ${costPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                      : '- R$ —'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-1">
                  <span className="text-sm font-bold text-emerald-700">Margem estimada</span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      margin ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                    }`}
                  >
                    {margin ? `${margin}%` : '—'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-lg">
                  * Calculado automaticamente ao preencher custo + preço
                </p>
              </div>
            </section>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-16 md:bottom-0 left-0 md:left-[72px] right-0 z-30">
        <Link
          href="/catalogo"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
        >
          Cancelar
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Salvar alterações
        </button>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
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
                  <span className="font-semibold text-gray-700">&quot;{name}&quot;</span>? Esta ação
                  não pode ser desfeita.
                </p>
              </div>

              {deleteError && <Alert variant="error">{deleteError}</Alert>}

              <div className="flex gap-3 mt-1">
                <Button
                  variant="outline"
                  fullWidth
                  disabled={deleting}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError('');
                  }}
                >
                  Cancelar
                </Button>
                <Button variant="danger" fullWidth loading={deleting} onClick={handleDeleteConfirm}>
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
