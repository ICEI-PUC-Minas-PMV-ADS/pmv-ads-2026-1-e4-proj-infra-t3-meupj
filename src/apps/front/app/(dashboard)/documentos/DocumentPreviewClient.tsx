'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, Download, ExternalLink, FileText } from 'lucide-react';
import { Alert, Button, Spinner } from '@/components/ui';
import { DocumentsService, type DocumentPdfAsset } from '@/services/documents.service';

type DocumentPreviewKind = 'budget' | 'serviceOrder' | 'receipt';

interface DocumentPreviewClientProps {
  backHref: string;
  documentId: string;
  kind: DocumentPreviewKind;
  subtitle: string;
  title: string;
}

const loadDocumentAsset = async (
  kind: DocumentPreviewKind,
  documentId: string,
): Promise<DocumentPdfAsset> => {
  switch (kind) {
    case 'budget':
      return DocumentsService.getBudgetPdfUrl(documentId);
    case 'serviceOrder':
      return DocumentsService.getServiceOrderPdfUrl(documentId);
    case 'receipt':
      return DocumentsService.getReceiptPdfUrl(documentId);
    default:
      throw new Error('Unsupported document preview type.');
  }
};

export default function DocumentPreviewClient({
  backHref,
  documentId,
  kind,
  subtitle,
  title,
}: DocumentPreviewClientProps) {
  const [asset, setAsset] = useState<DocumentPdfAsset | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let currentUrl: string | null = null;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const nextAsset = await loadDocumentAsset(kind, documentId);

        if (!active) {
          DocumentsService.revokePdfUrl(nextAsset.url);
          return;
        }

        currentUrl = nextAsset.url;
        setAsset(nextAsset);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        setError(error instanceof Error ? error.message : 'Falha ao carregar documento.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;

      if (currentUrl) {
        DocumentsService.revokePdfUrl(currentUrl);
      }
    };
  }, [documentId, kind]);

  const handleDownload = () => {
    if (!asset) return;

    const anchor = document.createElement('a');
    anchor.href = asset.url;
    anchor.download = asset.filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleOpenInNewTab = () => {
    if (!asset) return;

    window.open(asset.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-4 md:px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={backHref}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>

          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Preview de documento
            </p>
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleOpenInNewTab} disabled={!asset || loading}>
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Abrir em nova aba</span>
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={!asset || loading}>
            <Download size={16} />
            <span className="hidden sm:inline">Baixar PDF</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 bg-gray-50/50 p-4 md:p-6 overflow-y-auto">
        {loading && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
            <Spinner size={32} />
            <p className="text-sm font-medium">Carregando preview...</p>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-3xl mx-auto pt-12">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {!loading && !error && asset && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <iframe src={asset.url} title={title} className="w-full min-h-[75vh] bg-white" />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
              <FileText size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <p>
                Se o navegador não exibir o PDF embutido, use os botões acima para abrir em nova aba
                ou baixar o arquivo.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
