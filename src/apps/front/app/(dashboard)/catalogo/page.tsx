import Link from 'next/link';
import { Search, Plus, Filter } from 'lucide-react';

const items = [
  { id: 1, type: 'Serviço', title: 'Consultoria', price: 'R$ 200/h', color: 'text-indigo-700', badgeBg: 'bg-indigo-50' },
  { id: 2, type: 'Produto', title: 'Tinta acrílica', price: 'R$ 45/un', color: 'text-amber-800', badgeBg: 'bg-amber-100/50' },
  { id: 3, type: 'Serviço', title: 'Instalação', price: 'R$ 120/dia', color: 'text-indigo-700', badgeBg: 'bg-indigo-50' },
  { id: 4, type: 'Produto', title: 'Cabo HDMI', price: 'R$ 35/un', color: 'text-amber-800', badgeBg: 'bg-amber-100/50' },
  { id: 5, type: 'Serviço', title: 'Manutenção', price: 'R$ 80/h', color: 'text-indigo-700', badgeBg: 'bg-indigo-50' },
];

export default function CatalogoPage() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-6 py-6 md:px-10 border-b border-gray-100 flex flex-col gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catálogo</h1>
            <div className="relative max-w-md flex-1 hidden md:block ml-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-500 font-medium text-gray-800"
                placeholder="Buscar produtos e serviços..."
              />
            </div>
          </div>
          <div className="flex gap-3">
             <button className="md:hidden p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                <Search size={20} />
             </button>
             <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Filter size={18} />
                <span className="text-sm font-medium hidden sm:inline">Filtrar</span>
             </button>
             <Link href="/catalogo/novo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
                <Plus size={18} />
                <span className="hidden sm:inline">Novo item</span>
             </Link>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex gap-8 -mb-6">
          <button className="border-b-2 border-indigo-600 pb-4 text-sm font-semibold text-indigo-600 px-1">
            Todos
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1">
            Produtos
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1">
            Serviços
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30 overflow-y-auto">
         {/* Desktop Grid View */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer p-3 flex flex-col gap-3 border border-gray-200 hover:border-indigo-400">
              <div className="h-[120px] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="w-10 h-10 bg-gray-200 rounded-lg shadow-sm"></div>
              </div>
              <div className="px-1 flex flex-col gap-1 pb-1">
                <div className="flex items-start">
                   <span className={`text-[11px] font-bold ${item.color} ${item.badgeBg} px-2.5 py-0.5 rounded-full inline-flex`}>
                     {item.type}
                   </span>
                </div>
                <h3 className="font-bold text-gray-900 text-[15px] mt-1.5 truncate">{item.title}</h3>
                <p className="text-[13px] font-bold text-indigo-600 mt-0.5">{item.price}</p>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <Link href="/catalogo/novo" className="border-2 border-dashed border-gray-200 rounded-xl h-full min-h-[220px] flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110">
              <Plus size={24} className="group-hover:text-indigo-600 transition-colors" />
            </div>
            <span className="text-sm font-semibold">Novo item</span>
          </Link>
        </div>

        {/* Mobile List View */}
        <div className="sm:hidden flex flex-col gap-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center"></div>
                 <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color} mt-0.5`}>
                        {item.type}
                     </span>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.price}</p>
                 </div>
              </div>
           ))}
           
           {/* Mobile FAB */}
           <Link href="/catalogo/novo" className="fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40">
              <Plus size={24} />
           </Link>
        </div>
      </main>
    </div>
  );
}
