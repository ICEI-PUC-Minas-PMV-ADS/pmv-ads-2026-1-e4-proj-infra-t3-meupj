'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { ClientsService, type PersonType, type ClientCreatePayload } from '@/services/clients.service';
import { useClients } from '@/contexts/clients.context';

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const CHEVRON_SVG = (
  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

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
  }, [tipo, name, document, email, phone, zipCode, street, number, district, city, state, origin, notes, router]);

  const inputClasses = "w-full text-black px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white disabled:opacity-60";

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
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Identificação */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Identificação</h2>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-2">
                <label className="text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <div className="flex bg-gray-100/80 p-1 rounded-xl h-[48px]">
                  <button
                    type="button"
                    onClick={() => setTipo('pf')}
                    disabled={loading}
                    className={`flex-1 text-sm font-semibold rounded-lg transition-all ${tipo === 'pf' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                  >
                    PF
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('pj')}
                    disabled={loading}
                    className={`flex-1 text-sm font-semibold rounded-lg transition-all ${tipo === 'pj' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                  >
                    PJ
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">{tipo === 'pf' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Como conseguiu esse cliente?</label>
                <div className="relative">
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    disabled={loading}
                    className={`${inputClasses} appearance-none cursor-pointer text-gray-700 h-[48px]`}
                  >
                    <option value="">—</option>
                    <option value="indicacao">Indicação</option>
                    <option value="redes_sociais">Redes Sociais</option>
                    <option value="site">Site</option>
                    <option value="outros">Outros</option>
                  </select>
                  {CHEVRON_SVG}
                </div>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Contato</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">E-mail <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
            </div>
          </section>

          {/* Endereço */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Endereço</h2>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 sm:w-1/4">
                <label className="text-sm font-medium text-gray-700">CEP</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Logradouro</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2 sm:w-1/6">
                <label className="text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-2">
                <label className="text-sm font-medium text-gray-700">Bairro</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2 flex-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  className={inputClasses}
                  placeholder=""
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">UF</label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={loading}
                    className={`${inputClasses} appearance-none cursor-pointer text-gray-700 h-[48px]`}
                  >
                    <option value="">—</option>
                    {UF_OPTIONS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                  {CHEVRON_SVG}
                </div>
              </div>
            </div>
          </section>

          {/* Anotações */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Anotações Internas</h2>

            <div className="flex flex-col gap-2">
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                className={`${inputClasses} resize-none`}
                placeholder=""
              ></textarea>
              <p className="text-[11px] font-medium text-gray-400 pl-1 mt-1">Não visível ao cliente</p>
            </div>
          </section>

        </form>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-0 left-0 md:left-[72px] right-0 z-30 pb-safe">
        <Link
          href="/clientes"
          className="px-5 py-2.5 rounded-xl text-sm cursor-pointer font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
        >
          Cancelar
        </Link>
        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl text-sm cursor-pointer font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Salvar cliente
        </button>
      </div>
    </div>
  );
}
