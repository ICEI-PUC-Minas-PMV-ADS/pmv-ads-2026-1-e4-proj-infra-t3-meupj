import DocumentPreviewClient from '../../DocumentPreviewClient';

interface BudgetPreviewPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function BudgetPreviewPage({ params }: BudgetPreviewPageProps) {
  const { orderId } = await params;

  return (
    <DocumentPreviewClient
      backHref="/pedidos"
      documentId={orderId}
      kind="budget"
      subtitle="Orçamento comercial do pedido selecionado"
      title="Orçamento"
    />
  );
}
