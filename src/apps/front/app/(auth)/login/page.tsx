import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Entrar</h1>
        <p className="mt-2 text-gray-500">Acesse sua conta para continuar</p>
      </div>

      <form className="flex flex-col gap-5">
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
          <div className="flex justify-end mt-1">
            <Link href="/recuperacao-senha" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <button 
          type="button" 
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
        >
          Entrar
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">ou</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Não tem conta? <Link href="/cadastro" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
