'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { ClientsService, type PersonType } from '@/services/clients.service';
import { Input, Select, Textarea, Button, Alert, Badge, Spinner } from '@/components/ui';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const ORIGIN_OPTIONS = [
  { value: '', label: '—' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'redes_sociais', label: 'Redes Sociais' },
  { value: 'site', label: 'Site' },
  { value: 'outros', label: 'Outros' },
];

const TYPE_BADGE: Record<PersonType, { variant: 'indigo' | 'warning'; label: string }> = {
  individual: { variant: 'indigo', label: 'PF' },
  company: { variant: 'warning', label: 'PJ' },
};

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [fetchLoading, setFetchLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Identificação
  const [tipo, setTipo] = useState<'pf' | 'pj'>('pf');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [origin, setOrigin] = useState('');

  // Contato
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Endereço
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Anotações
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Carrega o cliente na montagem
  useEffect(() => {
    const load = async () => {
      setFetchLoading(true);
      try {
        const found = await ClientsService.getById(id);

        setTipo(found.type === 'company' ? 'pj' : 'pf');
        setName(found.name);
        setDocument(found.document ?? '');
        setOrigin(found.origin ?? '');
        setEmail(found.email ?? '');
        setPhone(found.phone ?? '');
        setZipCode(found.address?.zipCode ?? '');
        setStreet(found.address?.street ?? '');
        setNumber(found.address?.number ?? '');
        setDistrict(found.address?.district ?? '');
        setCity(found.address?.city ?? '');
        setState(found.address?.state ?? '');
        setNotes(found.notes ?? '');
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
          router.replace('/login');
          return;
        }
        if (err instanceof Error && err.message === 'Cliente não encontrado.') {
          setNotFound(true);
          return;
        }
        setError('Falha ao carregar o cliente.');
      } finally {
        setFetchLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSave = useCallback(async () => {
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (!document.trim()) {
      setError(tipo === 'pf' ? 'O CPF é obrigatório.' : 'O CNPJ é obrigatório.');
      return;
    }
    if (!email.trim()) {
      setError('O e-mail é obrigatório.');
      return;
    }
    if (!phone.trim()) {
      setError('O telefone é obrigatório.');
      return;
    }

    const personType: PersonType = tipo === 'pf' ? 'individual' : 'company';

    const payload = {
      name: name.trim(),
      type: personType,
      document: document.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: {
        zipCode: zipCode.trim(),
        street: street.trim(),
        number: number.trim(),
        district: district.trim(),
        city: city.trim(),
        state: state.trim(),
      },
      ...(origin && { origin }),
      ...(notes.trim() && { notes: notes.trim() }),
    };

    setLoading(true);
    try {
      await ClientsService.update(id, payload);
      setSuccess(true);
      setTimeout(() => router.push('/clientes'), 1500);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Falha ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  }, [id, tipo, name, document, email, phone, zipCode, street, number, district, city, state, origin, notes]);

  const handleDelete = () => {
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await ClientsService.delete(id);
      router.push('/clientes');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setDeleteError(err instanceof Error ? err.message : 'Falha ao excluir cliente.');
      setDeleting(false);
    }
  }, [id, router]);

  // ─── Estado de carregamento inicial ────────────────────────────────────────

  if (fetchLoading) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-3 text-gray-400">
        <Spinner size={32} />
        <p className="text-sm">Carregando cliente...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center gap-4 text-gray-400">
        <p className="font-medium text-gray-600">Cliente não encontrado</p>
        <Link href="/clientes" className="text-indigo-600 text-sm font-medium hover:underline">
          Voltar para clientes
        </Link>
      </div>
    );
  }

  const badgeInfo = TYPE_BADGE[tipo === 'pf' ? 'individual' : 'company'];

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/clientes"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-gray-900 tracking-wide truncate max-w-[180px] sm:max-w-xs">
              {name || 'Editar Cliente'}
            </h1>
            <Badge variant={badgeInfo.variant} className="hidden sm:inline-flex">
              {badgeInfo.label}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
          <span className="hidden sm:inline">Excluir</span>
        </Button>
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
        <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>

          {/* Feedback */}
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">Cliente atualizado com sucesso!</Alert>}

          {/* Identificação */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Identificação</h2>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-[2]">
                <Input
                  label="Nome *"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-600">Tipo</span>
                  <div className="flex bg-gray-100/80 p-1 rounded-xl h-[44px]">
                    <button
                      type="button"
                      onClick={() => setTipo('pf')}
                      disabled={loading}
                      className={`flex-1 text-sm cursor-pointer font-semibold rounded-lg transition-all ${tipo === 'pf' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                    >
                      PF
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('pj')}
                      disabled={loading}
                      className={`flex-1 text-sm cursor-pointer font-semibold rounded-lg transition-all ${tipo === 'pj' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                    >
                      PJ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1">
                <Input
                  label={`${tipo === 'pf' ? 'CPF' : 'CNPJ'} *`}
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
              <div className="flex-1">
                <Select
                  label="Como conseguiu esse cliente?"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  disabled={loading}
                  options={ORIGIN_OPTIONS}
                  selectSize="lg"
                />
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Contato</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="E-mail *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                inputSize="lg"
              />
              <Input
                label="Telefone *"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                inputSize="lg"
              />
            </div>
          </section>

          {/* Endereço */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Endereço</h2>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="sm:w-1/4">
                <Input
                  label="CEP"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Logradouro"
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
              <div className="sm:w-1/6">
                <Input
                  label="Número"
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-2">
                <Input
                  label="Bairro"
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
              <div className="flex-2">
                <Input
                  label="Cidade"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  inputSize="lg"
                />
              </div>
              <div className="flex-1">
                <Select
                  label="UF"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={loading}
                  selectSize="lg"
                >
                  <option value="">—</option>
                  {UF_OPTIONS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </Select>
              </div>
            </div>
          </section>

          {/* Anotações */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Anotações Internas</h2>

            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              hint="Não visível ao cliente"
            />
          </section>

        </form>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-16 md:bottom-0 left-0 md:left-[72px] right-0 z-30">
        <Button variant="outline" onClick={() => router.push('/clientes')}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          loading={loading}
          onClick={handleSave}
        >
          Salvar alterações
        </Button>
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
                <h3 className="text-base font-bold text-gray-900">Excluir cliente?</h3>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Tem certeza que deseja excluir{' '}
                  <span className="font-semibold text-gray-700">&quot;{name}&quot;</span>?
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
                  onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
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
