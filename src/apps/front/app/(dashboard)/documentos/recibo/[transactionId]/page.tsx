import DocumentPreviewClient from '../../DocumentPreviewClient';

interface ReceiptPreviewPageProps {
  params: Promise<{ transactionId: string }>;
}

export default async function ReceiptPreviewPage({ params }: ReceiptPreviewPageProps) {
  const { transactionId } = await params;

  return (
    <DocumentPreviewClient
      backHref="/dashboard"
      documentId={transactionId}
      kind="receipt"
      subtitle="Recibo do lançamento confirmado selecionado"
      title="Recibo"
    />
  );
}
