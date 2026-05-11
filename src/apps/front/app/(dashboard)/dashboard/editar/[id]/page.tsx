import EditTransactionClient from './EditTransactionClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditTransactionClient params={params} />;
}
