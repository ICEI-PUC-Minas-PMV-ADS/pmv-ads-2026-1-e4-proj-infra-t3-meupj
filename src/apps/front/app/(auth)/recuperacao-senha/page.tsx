'use client';

import Link from 'next/link';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function RecuperacaoSenhaPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/login" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-8 group transition-all">
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Voltar para login
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recuperar senha</h1>
        <p className="mt-2 text-gray-500 leading-relaxed">
          Informe seu e-mail cadastrado e enviaremos um link com as instruções para redefinição.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">E-mail cadastrado</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input 
              type="email" 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="seu@email.com"
              disabled={isSubmitted}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitted}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitted ? 'Enviando...' : 'Recuperar senha'}
        </button>

        {isSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-800">E-mail enviado com sucesso</h3>
              <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                Verifique sua caixa de entrada. O link de recuperação expira em 30 minutos.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
