'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ClientsService, type PersonType, type ClientCreatePayload } from '@/services/clients.service';
import { useClients } from '@/contexts/clients.context';
import { Input, Select, Textarea, Button, Alert } from '@/components/ui';

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

/** Formata telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function NovoClientePage() {
  const router = useRouter();
  const { refreshClients } = useClients();
  const [error, setError] = useState<string | null>(null);

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

  // UI
  const [loading, setLoading] = useState(false);

  const handleSave = useCallback(async () => {
    setError('');

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

    const payload: ClientCreatePayload = {
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
      await ClientsService.create(payload);
      await refreshClients();
      router.push('/clientes');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Não autorizado. Faça login novamente.') {
        router.replace('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Falha ao salvar cliente.');
    } finally {
      setLoading(false);
    }
  }, [tipo, name, document, email, phone, zipCode, street, number, district, city, state, origin, notes, router, refreshClients]);

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/clientes" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Novo Cliente</h1>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
        <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>

          {/* Erro geral */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Identificação */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Identificação</h2>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-2">
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
                      className={`flex-1 text-sm font-semibold rounded-lg transition-all cursor-pointer ${tipo === 'pf' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                    >
                      PF
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('pj')}
                      disabled={loading}
                      className={`flex-1 text-sm font-semibold rounded-lg transition-all cursor-pointer ${tipo === 'pj' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
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
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                disabled={loading}
                inputSize="lg"
                placeholder="(00) 00000-0000"
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
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-0 left-0 md:left-[72px] right-0 z-30 pb-safe">
        <Button variant="outline" onClick={() => router.push('/clientes')}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          loading={loading}
          onClick={handleSave}
        >
          Salvar cliente
        </Button>
      </div>
    </div>
  );
}
