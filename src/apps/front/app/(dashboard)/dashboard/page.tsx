import Link from 'next/link';
import { ChevronDown, Plus } from 'lucide-react';

const transactions = [
  { id: 1, type: 'income', title: 'Consultoria — PED-0004', subtitle: 'João Ferreira · Pix · 14/03', status: 'confirmado', value: '+R$ 1.200', dot: 'bg-emerald-500', valueColor: 'text-emerald-700', badgeColor: 'bg-emerald-100/60 text-emerald-700' },
  { id: 2, type: 'expense', title: 'Aluguel do espaço', subtitle: 'Custo geral · 10/03', status: 'pago', value: '-R$ 350', dot: 'bg-red-500', valueColor: 'text-red-700', badgeColor: 'bg-emerald-100/60 text-emerald-700' },
  { id: 3, type: 'income', title: 'Parcela 2/3 — PED-0003', subtitle: 'Ana Silveira · 30/03', status: 'pendente', value: '+R$ 400', dot: 'bg-blue-500', valueColor: 'text-emerald-700', badgeColor: 'bg-blue-100/60 text-blue-700' },
  { id: 4, type: 'expense', title: 'Material de escritório', subtitle: 'Custo geral · venc. 05/03', status: 'atrasado', value: '-R$ 80', dot: 'bg-red-500', valueColor: 'text-red-700', badgeColor: 'bg-red-100/60 text-red-700' },
];

export default function FinanceiroPage() {
  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <header className="px-6 py-6 md:px-10 border-b border-gray-100 flex flex-col gap-6 relative md:sticky md:top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financeiro</h1>
          </div>
          <div className="flex gap-3">
             <button className="hidden sm:flex px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors items-center gap-2 text-sm font-medium">
                Este mês <ChevronDown size={16} className="text-gray-400" />
             </button>
             <Link href="/dashboard/novo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
                <Plus size={18} />
                <span className="hidden sm:inline">Novo lançamento</span>
             </Link>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-1 md:mt-2">
           <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
             <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">Receita confirmada</span>
             <div className="bg-emerald-100/60 text-emerald-800 font-bold px-2 md:px-3 py-1.5 md:py-2 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-xs md:text-base">
               R$ 1.200,00
             </div>
             <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-[11px] md:text-sm font-medium text-gray-600">confirmado</span>
             </div>
           </div>
           
           <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">A receber</span>
             <div className="bg-blue-100/60 text-blue-800 font-bold px-2 md:px-3 py-1.5 md:py-2 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-xs md:text-base">
               R$ 400,00
             </div>
             <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               <span className="text-[11px] md:text-sm font-medium text-gray-600">pendente</span>
             </div>
           </div>

           <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
             <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">Em atraso</span>
             <div className="bg-red-100/60 text-red-800 font-bold px-2 md:px-3 py-1.5 md:py-2 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-xs md:text-base">
               R$ 80,00
             </div>
             <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               <span className="text-[11px] md:text-sm font-medium text-gray-600">atrasado</span>
             </div>
           </div>

           <div className="border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-1 md:gap-1.5 relative overflow-hidden bg-gray-50/50">
             <div className="absolute top-0 left-0 w-1 h-full bg-gray-500"></div>
             <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-gray-400 uppercase">Resultado</span>
             <div className="bg-gray-200/60 text-gray-800 font-bold px-2 md:px-3 py-1.5 md:py-2 rounded-md inline-block w-fit mt-0.5 md:mt-1 text-xs md:text-base">
               R$ 770,00
             </div>
             <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
               <span className="text-[11px] md:text-sm font-medium text-gray-500">receitas - custos</span>
             </div>
           </div>
        </div>

        {/* Chart placeholder */}
        <div className="w-full h-24 flex flex-col items-center justify-end pb-2 relative opacity-70">
           <div className="flex items-end gap-1.5 sm:gap-3 h-16">
              {[4, 6, 5, 8, 12, 10, 14, 9, 11, 7].map((h, i) => (
                <div key={i} className={`w-3 sm:w-6 rounded-t-sm ${i % 3 === 0 ? 'bg-emerald-200' : 'bg-blue-200'}`} style={{ height: `${h * 10}%` }}></div>
              ))}
           </div>
           <span className="text-[10px] text-gray-400 mt-2">Receitas por mês</span>
        </div>

        {/* Tabs */}
        <nav className="flex gap-8 -mb-6 border-t border-gray-100 pt-4 mt-2">
          <button className="border-b-2 border-indigo-600 pb-4 text-sm font-semibold text-indigo-600 px-1">
            Todos
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1">
            Receitas
          </button>
          <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors px-1">
            Custos
          </button>
        </nav>
      </header>

      <main className="flex-1 p-6 md:p-10 bg-gray-50/30">
         {/* List View */}
        <div className="flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           {transactions.map((tx, index) => (
              <div key={tx.id} className={`flex items-center gap-4 py-4 ${index !== transactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                 <div className={`w-2 h-2 rounded-full ${tx.dot} flex-shrink-0 mt-1 self-start sm:self-center`}></div>
                 <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{tx.title}</h3>
                    <p className="text-[12px] text-gray-500 mt-0.5 truncate">{tx.subtitle}</p>
                 </div>
                 <div className="text-right flex items-center justify-end gap-3 sm:gap-4">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tx.badgeColor} lowercase`}>
                        {tx.status}
                    </span>
                    <span className={`text-sm sm:text-base font-bold min-w-[70px] text-right ${tx.valueColor}`}>
                        {tx.value}
                    </span>
                 </div>
              </div>
           ))}
           
           {/* Mobile FAB */}
           <Link href="/dashboard/novo" className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors active:scale-95 z-40">
              <Plus size={24} />
           </Link>
        </div>
      </main>
    </div>
  );
}
