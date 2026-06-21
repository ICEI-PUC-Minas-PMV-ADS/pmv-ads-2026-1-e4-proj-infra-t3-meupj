import EditTransactionClient from './EditTransactionClient';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditTransactionClient params={params} />;
}
