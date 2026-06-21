import { apiClient, resolveApiErrorMessage } from './api-client';

export interface DocumentPdfAsset {
  url: string;
  filename: string;
}

type DocumentAssetKind = 'budget' | 'serviceOrder' | 'receipt';

const DOCUMENT_FILENAMES: Record<DocumentAssetKind, string> = {
  budget: 'orcamento',
  serviceOrder: 'ordem-servico',
  receipt: 'recibo',
};

const createDocumentAsset = async (
  kind: DocumentAssetKind,
  path: string,
  id: string,
  fallbackMessage: string,
): Promise<DocumentPdfAsset> => {
  try {
    const blob = await apiClient.get<Blob>(path, { parseAs: 'blob' });
    const url = URL.createObjectURL(blob);

    return {
      url,
      filename: `${DOCUMENT_FILENAMES[kind]}-${id}.pdf`,
    };
  } catch (error) {
    throw new Error(
      resolveApiErrorMessage(error, fallbackMessage, {
        401: 'Não autorizado. Faça login novamente.',
        404: 'Documento não encontrado.',
        409: 'Documento indisponível para o status atual.',
      }),
    );
  }
};

export const DocumentsService = {
  async getBudgetPdfUrl(orderId: string): Promise<DocumentPdfAsset> {
    return createDocumentAsset(
      'budget',
      `/api/documents/budget/${orderId}/pdf`,
      orderId,
      'Falha ao gerar orçamento.',
    );
  },

  async getServiceOrderPdfUrl(orderId: string): Promise<DocumentPdfAsset> {
    return createDocumentAsset(
      'serviceOrder',
      `/api/documents/service-order/${orderId}/pdf`,
      orderId,
      'Falha ao gerar ordem de serviço.',
    );
  },

  async getReceiptPdfUrl(transactionId: string): Promise<DocumentPdfAsset> {
    return createDocumentAsset(
      'receipt',
      `/api/documents/receipt/${transactionId}/pdf`,
      transactionId,
      'Falha ao gerar recibo.',
    );
  },

  revokePdfUrl(url: string): void {
    URL.revokeObjectURL(url);
  },
};
