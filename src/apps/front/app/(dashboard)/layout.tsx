'use client';

import React from 'react';
import { LayoutDashboard, Users, Settings, Package, ShoppingCart, Wallet } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 transition-transform hover:scale-105">
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

        <div className="mt-auto">
          <Link href="#" className="w-12 h-12 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" title="Configurações">
            <Settings size={22} strokeWidth={1.5} />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto relative flex flex-col ${!pathname?.includes('/novo') ? 'pb-20 md:pb-0' : ''}`}>
        {children}
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
        </nav>
      )}
    </div>
  );
}
