'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

export default function NovoItemCatalogo() {
  const [tipo, setTipo] = useState<'produto' | 'servico'>('produto');

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header Form */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/catalogo" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Novo Item do Catálogo</h1>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
        <form className="flex flex-col gap-10">
          
          {/* Tipo */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Tipo</h2>
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setTipo('produto')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tipo === 'produto' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
              >
                Produto
              </button>
              <button 
                type="button"
                onClick={() => setTipo('servico')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tipo === 'servico' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
              >
                Serviço
              </button>
            </div>
          </section>

          {/* Dados */}
          <section className="flex flex-col gap-5">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Dados</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white" placeholder="Ex: Consultoria, Cabo HDMI" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all resize-none bg-white" placeholder="Descreva os detalhes do item..."></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Preço unitário <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">R$</span>
                  </div>
                  <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white" placeholder="0,00" />
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-700">Unidade de medida</label>
                <div className="relative">
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer">
                    {tipo === 'produto' ? (
                      <>
                        <option value="un">Unidade (un)</option>
                        <option value="kg">Quilograma (kg)</option>
                        <option value="l">Litro (l)</option>
                        <option value="m">Metro (m)</option>
                        <option value="cx">Caixa (cx)</option>
                      </>
                    ) : (
                      <>
                        <option value="h">Hora (h)</option>
                        <option value="dia">Dia</option>
                        <option value="mes">Mês</option>
                        <option value="projeto">Por projeto</option>
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Custo & Margem */}
          {tipo === 'produto' && (
            <section className="flex flex-col gap-5 animate-in fade-in duration-300">
              <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                Custo & Margem 
                <span className="text-[10px] font-medium normal-case text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">(só para produtos)</span>
              </h2>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Custo unitário</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">R$</span>
                  </div>
                  <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white" placeholder="0,00" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 mt-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Preço de venda</span>
                  <span className="text-sm font-bold text-gray-900">R$ 0,00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Custo</span>
                  <span className="text-sm font-bold text-red-500">- R$ 0,00</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center mt-1">
                  <span className="text-sm font-bold text-emerald-700">Margem estimada</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">0%</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-lg">* Calculado automaticamente ao preencher custo + preço</p>
              </div>
            </section>
          )}

        </form>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 fixed bottom-0 left-0 md:left-[72px] right-0 z-30 pb-safe">
        <Link href="/catalogo" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95">
          Cancelar
        </Link>
        <button type="button" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95">
          Salvar item
        </button>
      </div>
    </div>
  );
}
