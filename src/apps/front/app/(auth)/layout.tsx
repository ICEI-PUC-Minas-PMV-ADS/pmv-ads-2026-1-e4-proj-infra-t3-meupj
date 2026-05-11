import Image from 'next/image';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-800/10 rounded-full blur-3xl"></div>
        </div>

        <div className="flex flex-col items-center max-w-md w-full space-y-8 z-10">
          {/* Mockup illustration based on provided reference */}
          <div className="w-full aspect-square border border-zinc-800/60 bg-zinc-900/50 backdrop-blur-sm shadow-2xl rounded-2xl flex items-center justify-center flex-col gap-8 p-10 relative">
            <div className="absolute top-4 left-4 flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            </div>

            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Image src="/logo.svg" alt="Logo" width={50} height={50} />
            </div>

            <div className="flex flex-col items-center gap-4 w-full px-8">
              <p className="font-medium text-gray-300 text-center">Gestão financeira simples, <br /> para você focar no que realmente importa: <span className="text-white font-semibold">o seu negócio.</span></p>
            </div>

            {/* Simulated placeholder skeleton */}
            <div className="w-full max-w-[260px] h-32 border border-zinc-800/80 rounded-xl mt-4 flex flex-col items-center justify-center gap-3 bg-zinc-800/10">
              <div className="h-2 w-2/3 bg-zinc-800 rounded-full"></div>
              <div className="h-2 w-1/2 bg-zinc-800 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div >
  );
}
