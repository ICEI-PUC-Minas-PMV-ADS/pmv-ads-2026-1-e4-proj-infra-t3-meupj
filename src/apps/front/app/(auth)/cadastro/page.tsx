import Link from 'next/link';
import { Mail, Lock, User } from 'lucide-react';

export default function CadastroPage() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Criar conta</h1>
        <p className="mt-2 text-gray-500">É rápido e gratuito</p>
      </div>

      <form className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Nome completo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white shadow-sm"
              placeholder="Ex: João da Silva"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input 
              type="email" 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white shadow-sm"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <input 
              type="password" 
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white shadow-sm"
              placeholder="••••••••"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 pl-1">Use ao menos 8 caracteres</p>
        </div>

        <div className="flex items-start gap-3 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <input 
            type="checkbox" 
            id="terms"
            className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
            Concordo com os <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Termos de Uso</a> e <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Privacidade</a>
          </label>
        </div>

        <button 
          type="button" 
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
        >
          Criar conta
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem conta? <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
