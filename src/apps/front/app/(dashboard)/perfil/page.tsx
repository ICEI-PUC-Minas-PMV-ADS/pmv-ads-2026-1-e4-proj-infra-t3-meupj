'use client';

import { useState } from 'react';

export default function PerfilDemoPage() {
  const [saved, setSaved] = useState(false);

  return (
    <main className="flex flex-col gap-6">
      <section>
        <p className="text-sm font-medium text-indigo-600">MeuPJ</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Perfil profissional</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gerencie os dados utilizados em documentos, pedidos e informações comerciais.
        </p>
      </section>

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Dados do perfil salvos com sucesso.
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Dados da empresa</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {['Nome fantasia', 'CNPJ/CPF', 'E-mail comercial', 'Telefone', 'Cidade', 'Estado'].map((label) => (
            <div key={label}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:bg-white"
                placeholder={label}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Salvar alterações
          </button>
        </div>
      </section>
    </main>
  );
}