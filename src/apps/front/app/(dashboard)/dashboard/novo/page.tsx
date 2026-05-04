'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

export default function NovoLancamentoPage() {
  const [tipo, setTipo] = useState<'receita' | 'custo'>('receita');

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header Form */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Novo Lançamento</h1>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
        <form className="flex flex-col gap-8">
          
          {/* Tipo */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl h-[48px]">
            <button 
              type="button"
              onClick={() => setTipo('receita')}
              className={`flex-1 text-sm font-semibold rounded-lg transition-all ${tipo === 'receita' ? 'bg-white text-emerald-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
            >
              Receita
            </button>
            <button 
              type="button"
              onClick={() => setTipo('custo')}
              className={`flex-1 text-sm font-semibold rounded-lg transition-all ${tipo === 'custo' ? 'bg-white text-red-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
            >
              Custo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-[2]">
              <label className="text-sm font-medium text-gray-700">Valor <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium">R$</span>
                </div>
                <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white font-medium" placeholder="0,00" />
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700 h-[48px]">
                  <option value="confirmado">Confirmado / Pago</option>
                  <option value="pendente">Pendente</option>
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
              <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white text-gray-700" />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Vencimento</label>
              <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white text-gray-700" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Pedido vinculado <span className="text-gray-400 font-normal">(opcional)</span></label>
            <div className="relative">
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-500 h-[48px]">
                <option value="" disabled selected>Selecione um pedido...</option>
                <option value="1">PED-0003 - Ana Silveira</option>
                <option value="2">PED-0004 - João Ferreira</option>
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
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700 h-[48px]">
                  <option value="" disabled selected></option>
                  <option value="servicos">Serviços prestados</option>
                  <option value="produtos">Venda de produtos</option>
                  <option value="impostos">Impostos</option>
                  <option value="operacional">Custo operacional</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Meio pgto.</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700 h-[48px]">
                  <option value="" disabled selected></option>
                  <option value="pix">Pix</option>
                  <option value="boleto">Boleto</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="transferencia">Transferência bancária</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Referência</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white" placeholder="Ex: NF 1234, parcela 2/3" />
          </div>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-0 left-0 md:left-[72px] right-0 z-30 pb-safe">
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95">
          Cancelar
        </Link>
        <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95">
          Salvar lançamento
        </button>
      </div>
    </div>
  );
}
