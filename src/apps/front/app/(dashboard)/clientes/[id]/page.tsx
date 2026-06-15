import EditClientClient from './EditClientClient';

// Necessário para output: 'export' (Next.js exige ao menos uma entrada).
// O roteamento real acontece via 404.html fallback do GitHub Pages.
export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <EditClientClient />;
}
