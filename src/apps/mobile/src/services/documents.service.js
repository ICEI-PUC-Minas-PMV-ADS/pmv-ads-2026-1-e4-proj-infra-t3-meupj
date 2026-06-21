import { Linking, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { apiFetch, getApiUrl } from './api';

const DOCUMENT_FILENAMES = {
  budget: 'orcamento',
  receipt: 'recibo',
  serviceOrder: 'ordem-servico',
};

const resolveDocumentErrorMessage = (error, fallbackMessage) => {
  if (error && typeof error === 'object' && 'status' in error) {
    if (error.status === 401) {
      return 'Não autorizado. Faça login novamente.';
    }

    if (error.status === 404) {
      return 'Documento não encontrado.';
    }

    if (error.status === 409) {
      return 'Documento indisponível para o status atual.';
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};

const openDocumentOnWeb = async (path) => {
  const url = getApiUrl(path);

  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return url;
  }

  await Linking.openURL(url);
  return url;
};

const shareDocumentOnNative = async (path, filename, fallbackMessage) => {
  try {
    const pdfBuffer = await apiFetch(path, {
      headers: { Accept: 'application/pdf' },
      method: 'GET',
      parseAs: 'arrayBuffer',
    });

    const file = new File(Paths.cache, filename);
    file.create({ intermediates: true, overwrite: true });
    file.write(new Uint8Array(pdfBuffer));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        UTI: 'com.adobe.pdf',
        mimeType: 'application/pdf',
      });
      return file.uri;
    }

    await Linking.openURL(file.uri);
    return file.uri;
  } catch (error) {
    throw new Error(resolveDocumentErrorMessage(error, fallbackMessage));
  }
};

const openDocument = async (kind, id, path, fallbackMessage) => {
  if (Platform.OS === 'web') {
    return openDocumentOnWeb(path);
  }

  return shareDocumentOnNative(path, `${DOCUMENT_FILENAMES[kind]}-${id}.pdf`, fallbackMessage);
};

export const DocumentsService = {
  openBudgetPdf(orderId) {
    return openDocument(
      'budget',
      orderId,
      `/api/documents/budget/${orderId}/pdf`,
      'Falha ao gerar orçamento.',
    );
  },

  openReceiptPdf(transactionId) {
    return openDocument(
      'receipt',
      transactionId,
      `/api/documents/receipt/${transactionId}/pdf`,
      'Falha ao gerar recibo.',
    );
  },

  openServiceOrderPdf(orderId) {
    return openDocument(
      'serviceOrder',
      orderId,
      `/api/documents/service-order/${orderId}/pdf`,
      'Falha ao gerar ordem de serviço.',
    );
  },
};
