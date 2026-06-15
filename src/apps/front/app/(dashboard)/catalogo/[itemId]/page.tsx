import EditItemClient from './EditItemClient';

// Necessário para output: 'export' (Next.js exige ao menos uma entrada).
// O roteamento real acontece via 404.html fallback do GitHub Pages.
export async function generateStaticParams() {
  return [{ itemId: '_' }];
}

export default function Page() {
  return <EditItemClient />;
}
