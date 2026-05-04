import Link from 'next/link';
import { Search, Plus } from 'lucide-react';

const orders = [
  { id: 1, number: 'PED-0004-2026', client: 'João Ferreira', status: 'Em andamento', date: '14/03/2026', value: 'R$ 1.200', dot: 'bg-blue-500', badgeColor: 'bg-blue-50 text-blue-700' },
  { id: 2, number: 'PED-0003-2026', client: 'Ana Silveira', status: 'Aguard. aprovação', date: '10/03/2026', value: 'R$ 800', dot: 'bg-amber-500', badgeColor: 'bg-amber-50 text-amber-700' },
  { id: 3, number: 'PED-0002-2026', client: 'Carlos Mota', status: 'Concluído', date: '01/03/2026', value: 'R$ 450', dot: 'bg-emerald-500', badgeColor: 'bg-emerald-50 text-emerald-700' },
  { id: 4, number: 'PED-0001-2026', client: '-- sem cliente --', status: 'Rascunho', date: '28/02/2026', value: 'R$ 0', dot: 'bg-gray-400', badgeColor: 'bg-gray-100 text-gray-600' },
];

export default function PedidosPage() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-6 py-6 md:px-10 border-b border-gray-100 flex flex-col gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pedidos</h1>
            <div className="relative max-w-md flex-1 hidden md:block ml-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-500 font-medium text-gray-800"
                placeholder="Busque por número, cliente..."
              />
            </div>
          </div>
          <div className="flex gap-3">
             <button className="md:hidden p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                <Search size={20} />
             </button>
             <Link href="/pedidos/novo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
                <Plus size={18} />
                <span className="hidden sm:inline">Novo pedido</span>
             </Link>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-6 sm:gap-8 -mb-6 border-t border-gray-100 pt-4 mt-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <button className="border-b-2 border-indigo-600 pb-4 text-sm font-semibold text-indigo-600 px-1 whitespace-nowrap flex items-center gap-2">
            Todos <span className="bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-[10px]">12</span>
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1 whitespace-nowrap flex items-center gap-2">
            Rascunho <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[10px]">2</span>
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1 whitespace-nowrap flex items-center gap-2">
            Em andamento <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[10px]">5</span>
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1 whitespace-nowrap flex items-center gap-2">
            Concluído <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[10px]">3</span>
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1 whitespace-nowrap flex items-center gap-2">
            Cancelado <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-[10px]">2</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30 overflow-y-auto">
         {/* List View */}
        <div className="flex flex-col gap-3 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           {orders.map((order) => (
              <div key={order.id} className="bg-white p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 group cursor-pointer relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300">
                 <div className={`absolute top-0 left-0 w-1.5 h-full ${order.dot} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                 
                 <div className="flex-1 min-w-0 flex flex-col pl-2 sm:pl-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                       <div className={`w-2 h-2 rounded-full ${order.dot} flex-shrink-0`}></div>
                       <h3 className="font-bold text-gray-900 text-[15px]">{order.number}</h3>
                       <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${order.badgeColor}`}>
                           {order.status}
                       </span>
                    </div>
                    <p className="text-[13px] font-medium text-gray-500 mt-1 pl-4 sm:pl-5 truncate">{order.client}</p>
                 </div>
                 
                 <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-2 sm:pl-0 mt-2 sm:mt-0">
                    <span className="text-[15px] font-bold text-gray-900">
                        {order.value}
                    </span>
                    <span className="text-[12px] font-medium text-gray-400 mt-0.5">
                        {order.date}
                    </span>
                 </div>
              </div>
           ))}
           
           {/* Mobile FAB */}
           <Link href="/pedidos/novo" className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40">
              <Plus size={24} />
           </Link>
        </div>
      </main>
    </div>
  );
}
