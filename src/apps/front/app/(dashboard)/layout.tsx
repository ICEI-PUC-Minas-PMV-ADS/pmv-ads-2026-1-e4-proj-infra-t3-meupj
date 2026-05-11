'use client';

import React from 'react';
import { LayoutDashboard, Users, Settings, Package, ShoppingCart, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { ClientsProvider } from '@/contexts/clients.context';
import { CatalogProvider } from '@/contexts/catalog.context';
import { OrdersProvider } from '@/contexts/orders.context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Catálogo', href: '/catalogo', icon: Package },
    { name: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[72px] bg-zinc-900 items-center py-6 gap-6 border-r border-zinc-800 z-20">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 transition-transform hover:scale-105"
        >
          <Image src="/logo.svg" alt="Logo" width={50} height={50} />
        </Link>

        <nav className="flex flex-col gap-4 flex-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                title={item.name}
              >
                <Icon size={22} strokeWidth={1.5} />
                {isActive && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/configuracoes"
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative ${
              pathname?.startsWith('/configuracoes')
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Configurações"
          >
            <Settings size={22} strokeWidth={1.5} />
            {pathname?.startsWith('/configuracoes') && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-r-full"></div>
            )}
          </Link>
          <button
            onClick={logout}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500/20 transition-colors"
            title="Sair"
          >
            <LogOut size={22} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto relative flex flex-col ${!pathname?.includes('/novo') ? 'pb-20 md:pb-0' : ''}`}
      >
        <ClientsProvider>
          <CatalogProvider>
            <OrdersProvider>{children}</OrdersProvider>
          </CatalogProvider>
        </ClientsProvider>
      </main>

      {/* Mobile Bottom Navigation */}
      {!pathname?.includes('/novo') && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-50 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3 transition-colors flex flex-col items-center gap-1 ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          <Link
            href="/configuracoes"
            className={`p-3 transition-colors flex flex-col items-center gap-1 ${
              pathname?.startsWith('/configuracoes')
                ? 'text-indigo-600'
                : 'text-gray-400 hover:text-indigo-600'
            }`}
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Config</span>
          </Link>
          <button
            onClick={logout}
            className="p-3 transition-colors flex flex-col items-center gap-1 text-gray-400 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium">Sair</span>
          </button>
        </nav>
      )}
    </div>
  );
}
