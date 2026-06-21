import DocumentPreviewClient from '../../DocumentPreviewClient';

interface ServiceOrderPreviewPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ServiceOrderPreviewPage({ params }: ServiceOrderPreviewPageProps) {
  const { orderId } = await params;

  return (
    <DocumentPreviewClient
      backHref="/pedidos"
      documentId={orderId}
      kind="serviceOrder"
      subtitle="Ordem de serviço do pedido selecionado"
      title="Ordem de Serviço"
    />
  );
}
