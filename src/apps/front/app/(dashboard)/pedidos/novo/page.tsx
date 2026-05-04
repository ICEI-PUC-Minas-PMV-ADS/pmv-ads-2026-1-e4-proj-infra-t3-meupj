'use client';

import Link from 'next/link';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function NovoPedidoPage() {
  const [items, setItems] = useState([{ id: 1, desc: '', qtd: 1, preco: 0 }, { id: 2, desc: '', qtd: 1, preco: 0 }]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/pedidos" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-sm font-bold text-gray-500 tracking-widest uppercase">Novo Pedido</h1>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-48 md:pb-32">
        <form className="flex flex-col gap-10">
          
          {/* Dados Gerais */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold tracking-widest text-gray-700 uppercase">Dados Gerais</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-500">Cliente</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700">
                    <option value="" disabled selected></option>
                    <option value="1">João Ferreira</option>
                    <option value="2">Ana Silveira</option>
                    <option value="3">Construtora Mota Ltda.</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700">
                    <option value="" disabled selected></option>
                    <option value="rascunho">Rascunho</option>
                    <option value="andamento">Em andamento</option>
                    <option value="aguardando">Aguardando aprovação</option>
                    <option value="concluido">Concluído</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-500">Referência (opcional)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white" placeholder="" />
            </div>
          </section>

          {/* Itens do Pedido */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold tracking-widest text-gray-700 uppercase">Itens do Pedido</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Header Tabela (Desktop) */}
              <div className="hidden sm:flex items-center gap-4 px-1 pt-2">
                <div className="flex-[3] text-xs font-bold tracking-widest text-gray-400 uppercase">Descrição</div>
                <div className="flex-1 text-xs font-bold tracking-widest text-gray-400 uppercase text-center">Qtd</div>
                <div className="flex-1 text-xs font-bold tracking-widest text-gray-400 uppercase text-right">Preço</div>
                <div className="flex-1 text-xs font-bold tracking-widest text-gray-400 uppercase text-right">Subtotal</div>
                <div className="w-8"></div>
              </div>

              {/* Linhas */}
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group">
                  <div className="w-full sm:flex-[3]">
                    <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descrição</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white" placeholder="Item do pedido..." />
                  </div>
                  
                  <div className="flex w-full sm:flex-none gap-3 flex-1">
                    <div className="flex-1">
                      <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Qtd</label>
                      <input type="number" min="1" defaultValue="1" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white text-center" />
                    </div>
                    <div className="flex-1">
                      <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase mb-1 block">Preço</label>
                      <input type="text" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white text-right" placeholder="0,00" />
                    </div>
                  </div>

                  <div className="flex w-full sm:flex-1 justify-between sm:justify-end items-center mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-0">
                    <label className="sm:hidden text-[10px] font-bold text-gray-400 uppercase">Subtotal</label>
                    <input type="text" className="w-full sm:w-auto px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-right outline-none cursor-not-allowed text-gray-500" readOnly placeholder="0,00" />
                  </div>

                  <button type="button" className="hidden sm:flex w-8 h-8 items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => setItems([...items, { id: Date.now(), desc: '', qtd: 1, preco: 0 }])} className="w-full py-3.5 mt-2 border border-dashed border-indigo-200 rounded-lg text-indigo-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-indigo-50/50 transition-colors">
                <Plus size={16} />
                Adicionar item do catálogo
              </button>
            </div>

            {/* Totais */}
            <div className="flex flex-col items-end gap-3 mt-6 w-full">
              <div className="flex justify-between items-center w-full sm:w-72">
                <span className="text-gray-500 text-sm font-medium">Subtotal</span>
                <span className="text-gray-900 font-medium text-sm">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center w-full sm:w-72">
                <span className="text-gray-500 text-sm font-medium">Desconto</span>
                <input type="text" className="w-28 px-3 py-2 rounded-lg border border-gray-200 outline-none text-right text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" placeholder="R$ 0,00" />
              </div>
              <div className="flex justify-between items-center w-full sm:w-72">
                <span className="text-gray-500 text-sm font-medium">Taxa entrega</span>
                <input type="text" className="w-28 px-3 py-2 rounded-lg border border-gray-200 outline-none text-right text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600" placeholder="R$ 0,00" />
              </div>
              
              <div className="flex justify-between items-center w-full sm:w-72 mt-2 pt-1">
                <span className="text-gray-900 font-bold">Total</span>
                <span className="text-indigo-600 font-bold text-lg">R$ 0,00</span>
              </div>
            </div>
          </section>

          {/* Pagamento */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold tracking-widest text-gray-700 uppercase">Pagamento</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-500">Meios aceitos</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700">
                    <option value="" disabled selected></option>
                    <option value="pix">Pix</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="boleto">Boleto</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium text-gray-500">Condições</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all bg-white appearance-none cursor-pointer text-gray-700">
                    <option value="" disabled selected></option>
                    <option value="avista">À vista</option>
                    <option value="2x">2x sem juros</option>
                    <option value="3x">3x sem juros</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 fixed bottom-0 left-0 md:left-[72px] right-0 z-30">
        <Link href="/pedidos" className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all text-center">
          Cancelar
        </Link>
        <button type="button" className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 transition-all text-center">
          Salvar rascunho
        </button>
        <button type="button" className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all text-center">
          Criar pedido
        </button>
      </div>
    </div>
  );
}
