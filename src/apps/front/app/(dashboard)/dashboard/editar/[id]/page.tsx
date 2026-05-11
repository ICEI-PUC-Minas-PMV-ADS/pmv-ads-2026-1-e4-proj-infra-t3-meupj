import EditTransactionClient from './EditTransactionClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: 'static' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditTransactionClient params={params} />;
}
