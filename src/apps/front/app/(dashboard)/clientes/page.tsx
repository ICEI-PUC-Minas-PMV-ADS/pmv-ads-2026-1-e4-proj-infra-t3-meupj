import Link from 'next/link';
import { Search, Plus, Filter, User } from 'lucide-react';

const clients = [
  { id: 1, name: 'João Ferreira', contact: '11 99999-8888 · joao@email.com', type: 'PF', color: 'text-indigo-700', badgeBg: 'bg-indigo-50' },
  { id: 2, name: 'Ana Silveira', contact: '11 98888-7777', type: 'PF', color: 'text-indigo-700', badgeBg: 'bg-indigo-50' },
  { id: 3, name: 'Construtora Mota Ltda.', contact: 'contato@mota.com.br', type: 'PJ', color: 'text-amber-800', badgeBg: 'bg-amber-100/50' },
  { id: 4, name: 'Pedro Santos', contact: '11 97777-6666', type: 'PF', color: 'text-indigo-700', badgeBg: 'bg-indigo-50' },
  { id: 5, name: 'Tech Serviços ME', contact: 'tech@servicos.com', type: 'PJ', color: 'text-amber-800', badgeBg: 'bg-amber-100/50' },
];

export default function ClientesPage() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="px-6 py-6 md:px-10 border-b border-gray-100 flex flex-col gap-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Clientes</h1>
            <div className="relative max-w-md flex-1 hidden md:block ml-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-500 font-medium text-gray-800"
                placeholder="Buscar por nome, e-mail..."
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
            <Link href="/clientes/novo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
              <Plus size={18} />
              <span className="hidden sm:inline">Novo cliente</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30 overflow-y-auto">
        {/* List View */}
        <div className="flex flex-col gap-3 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {clients.map((client, index) => (
            <div key={client.id} className={`bg-white p-4 sm:p-5 rounded-2xl transition-all flex items-center gap-4 sm:gap-5 group cursor-pointer border border-gray-100  shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-400`}>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 text-[15px] truncate">{client.name}</h3>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5 truncate">{client.contact}</p>
              </div>
              <div className="text-right flex items-center justify-end">
                <span className={`text-[11px] font-bold ${client.color} ${client.badgeBg} px-3 py-1.5 rounded-md inline-flex`}>
                  {client.type}
                </span>
              </div>
            </div>
          ))}

          {/* Mobile FAB */}
          <Link href="/clientes/novo" className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40">
            <Plus size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
}
