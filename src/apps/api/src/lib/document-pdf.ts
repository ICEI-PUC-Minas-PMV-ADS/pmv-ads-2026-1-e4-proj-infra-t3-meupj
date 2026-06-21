import { createElement, type ReactElement } from 'react';
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';

import type {
  BudgetDocumentPayload,
  ReceiptDocumentPayload,
  ServiceOrderDocumentPayload,
} from './documents.js';
import type { OrderStatus, PaymentMethod } from './orders.js';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    color: '#111827',
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.45,
    paddingBottom: 36,
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  header: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingBottom: 14,
  },
  documentBadge: {
    color: '#4f46e5',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 700,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexBasis: 0,
    flexGrow: 1,
  },
  columnGap: {
    marginRight: 12,
  },
  text: {
    color: '#374151',
    fontSize: 10.5,
    marginBottom: 3,
  },
  strong: {
    fontWeight: 700,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
  },
  itemCard: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 10,
  },
  itemCardLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    color: '#111827',
    fontSize: 11,
    fontWeight: 700,
  },
  muted: {
    color: '#6b7280',
    fontSize: 10,
  },
  summaryBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    minWidth: 220,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryTotal: {
    borderTopColor: '#d1d5db',
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 8,
  },
  footer: {
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    color: '#6b7280',
    fontSize: 9.5,
    marginTop: 18,
    paddingTop: 10,
  },
});

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Rascunho',
  pendingApproval: 'Aguardando aprovacao',
  inProgress: 'Em andamento',
  completed: 'Concluido',
  warranty: 'Garantia',
  cancelled: 'Cancelado',
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  creditCard: 'Cartao de credito',
  debitCard: 'Cartao de debito',
  bankTransfer: 'Transferencia bancaria',
  bankSlip: 'Boleto',
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  }).format(value);

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso));

const joinValues = (...values: Array<string | null | undefined>): string => {
  return values.filter((value): value is string => Boolean(value && value.trim())).join(', ');
};

const formatProfileAddress = (
  address:
    | BudgetDocumentPayload['profile']['address']
    | ReceiptDocumentPayload['profile']['address'],
): string => {
  const lineOne = joinValues(address.street, address.number, address.complement);
  const lineTwo = joinValues(address.district, address.city, address.state, address.country);
  const postal = address.zipCode ? `CEP ${address.zipCode}` : '';
  return [lineOne, lineTwo, postal].filter(Boolean).join(' | ');
};

const formatClientAddress = (
  address:
    | BudgetDocumentPayload['client']['address']
    | ReceiptDocumentPayload['client']['address']
    | undefined,
): string => {
  if (!address) {
    return '-';
  }

  const lineOne = joinValues(address.street, address.number, address.complement);
  const lineTwo = joinValues(address.district, address.city, address.state, address.country);
  const postal = address.zipCode ? `CEP ${address.zipCode}` : '';
  return [lineOne, lineTwo, postal].filter(Boolean).join(' | ');
};

const renderKeyValueLine = (label: string, value: string | null | undefined): ReactElement => {
  const safeValue = value && value.trim() ? value : '-';
  return createElement(
    Text,
    { style: styles.text },
    createElement(Text, { style: styles.strong }, `${label}: `),
    safeValue,
  );
};

const renderBusinessSection = (
  profile: BudgetDocumentPayload['profile'] | ReceiptDocumentPayload['profile'],
): ReactElement =>
  createElement(
    View,
    { style: [styles.column, styles.columnGap, styles.card] },
    createElement(Text, { style: styles.sectionTitle }, 'Emitente'),
    renderKeyValueLine('Nome', profile.name),
    renderKeyValueLine('Documento', profile.document),
    renderKeyValueLine('Telefone', profile.phone),
    renderKeyValueLine('Email', profile.email),
    renderKeyValueLine('Endereco', formatProfileAddress(profile.address)),
  );

const renderClientSection = (
  client: BudgetDocumentPayload['client'] | ReceiptDocumentPayload['client'],
): ReactElement =>
  createElement(
    View,
    { style: [styles.column, styles.card] },
    createElement(Text, { style: styles.sectionTitle }, 'Cliente'),
    renderKeyValueLine('Nome', client?.name),
    renderKeyValueLine('Documento', client?.document),
    renderKeyValueLine('Telefone', client?.phone),
    renderKeyValueLine('Email', client?.email),
    renderKeyValueLine('Endereco', formatClientAddress(client?.address)),
  );

const renderOrderMetaSection = (
  payload: BudgetDocumentPayload | ServiceOrderDocumentPayload,
): ReactElement =>
  createElement(
    View,
    { style: styles.section },
    createElement(Text, { style: styles.sectionTitle }, 'Dados do pedido'),
    createElement(
      View,
      { style: styles.row },
      createElement(
        View,
        { style: [styles.column, styles.columnGap] },
        renderKeyValueLine('Numero', payload.order.orderNumber),
        renderKeyValueLine('Status', ORDER_STATUS_LABELS[payload.order.status]),
        renderKeyValueLine('Criado em', formatDate(payload.order.createdAt)),
      ),
      createElement(
        View,
        { style: styles.column },
        renderKeyValueLine('Atualizado em', formatDate(payload.order.updatedAt)),
        renderKeyValueLine('Referencia', payload.order.reference),
        renderKeyValueLine('Condicoes de pagamento', payload.order.paymentTerms),
      ),
    ),
    payload.order.warrantyTerms
      ? renderKeyValueLine('Garantia', payload.order.warrantyTerms)
      : createElement(View),
    payload.order.additionalInfo
      ? renderKeyValueLine('Informacoes adicionais', payload.order.additionalInfo)
      : createElement(View),
  );

const renderOrderItemsSection = (
  payload: BudgetDocumentPayload | ServiceOrderDocumentPayload,
): ReactElement =>
  createElement(
    View,
    { style: styles.section },
    createElement(Text, { style: styles.sectionTitle }, 'Itens'),
    createElement(
      View,
      { style: styles.card },
      ...payload.order.items.map((item, index) =>
        createElement(
          View,
          {
            key: `${item.catalogItemId}:${item.position}`,
            style:
              index === payload.order.items.length - 1
                ? [styles.itemCard, styles.itemCardLast]
                : styles.itemCard,
          },
          createElement(
            View,
            { style: styles.itemHeader },
            createElement(
              View,
              { style: [styles.column, styles.columnGap] },
              createElement(Text, { style: styles.itemTitle }, item.name),
              createElement(
                Text,
                { style: styles.muted },
                `${item.quantity} x ${formatCurrency(item.unitPrice)} (${item.unitMeasure})`,
              ),
            ),
            createElement(Text, { style: styles.itemTitle }, formatCurrency(item.subtotal)),
          ),
          item.description
            ? createElement(Text, { style: styles.text }, item.description)
            : createElement(View),
          createElement(
            Text,
            { style: styles.muted },
            item.type === 'service' ? 'Servico' : 'Produto',
          ),
        ),
      ),
    ),
  );

const renderSummarySection = (
  payload: BudgetDocumentPayload | ServiceOrderDocumentPayload,
): ReactElement =>
  createElement(
    View,
    { style: styles.summaryBox },
    createElement(
      View,
      { style: styles.summaryRow },
      createElement(Text, { style: styles.text }, 'Subtotal'),
      createElement(Text, { style: styles.text }, formatCurrency(payload.summary.itemsSubtotal)),
    ),
    createElement(
      View,
      { style: styles.summaryRow },
      createElement(Text, { style: styles.text }, 'Desconto'),
      createElement(Text, { style: styles.text }, formatCurrency(payload.summary.discount)),
    ),
    createElement(
      View,
      { style: styles.summaryRow },
      createElement(Text, { style: styles.text }, 'Taxas'),
      createElement(Text, { style: styles.text }, formatCurrency(payload.summary.fees)),
    ),
    createElement(
      View,
      { style: [styles.summaryRow, styles.summaryTotal] },
      createElement(Text, { style: styles.strong }, 'Total'),
      createElement(Text, { style: styles.strong }, formatCurrency(payload.summary.total)),
    ),
  );

const renderCommercialDocument = (
  payload: BudgetDocumentPayload | ServiceOrderDocumentPayload,
  title: string,
  subtitle: string,
): ReactElement =>
  createElement(
    Document,
    {
      author: payload.profile.name ?? 'MeuPJ',
      creator: 'MeuPJ',
      subject: title,
      title: `${title} ${payload.order.orderNumber}`,
    },
    createElement(
      Page,
      { size: 'A4', style: styles.page },
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.documentBadge }, payload.documentType),
        createElement(Text, { style: styles.title }, title),
        createElement(
          Text,
          { style: styles.subtitle },
          `${subtitle} ${payload.order.orderNumber} | Emitido em ${formatDate(payload.generatedAt)}`,
        ),
      ),
      createElement(
        View,
        { style: [styles.section, styles.row] },
        renderBusinessSection(payload.profile),
        renderClientSection(payload.client),
      ),
      renderOrderMetaSection(payload),
      renderOrderItemsSection(payload),
      renderSummarySection(payload),
      createElement(
        Text,
        { style: styles.footer },
        payload.profile.footer?.trim()
          ? payload.profile.footer
          : 'Documento gerado automaticamente pelo MeuPJ.',
      ),
    ),
  );

const renderReceiptDocument = (payload: ReceiptDocumentPayload): ReactElement =>
  createElement(
    Document,
    {
      author: payload.profile.name ?? 'MeuPJ',
      creator: 'MeuPJ',
      subject: 'Recibo',
      title: `Recibo ${payload.transaction._id}`,
    },
    createElement(
      Page,
      { size: 'A4', style: styles.page },
      createElement(
        View,
        { style: styles.header },
        createElement(Text, { style: styles.documentBadge }, payload.documentType),
        createElement(Text, { style: styles.title }, 'Recibo'),
        createElement(
          Text,
          { style: styles.subtitle },
          `Recebimento confirmado em ${formatDate(payload.transaction.transactionDate)}`,
        ),
      ),
      createElement(
        View,
        { style: [styles.section, styles.row] },
        renderBusinessSection(payload.profile),
        renderClientSection(payload.client),
      ),
      createElement(
        View,
        { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, 'Dados do lancamento'),
        createElement(
          View,
          { style: styles.row },
          createElement(
            View,
            { style: [styles.column, styles.columnGap] },
            renderKeyValueLine(
              'Tipo',
              payload.transaction.type === 'income' ? 'Receita' : 'Despesa',
            ),
            renderKeyValueLine('Status', 'Confirmado'),
            renderKeyValueLine('Categoria', payload.transaction.category),
            renderKeyValueLine(
              'Forma de pagamento',
              payload.transaction.paymentMethod
                ? PAYMENT_METHOD_LABELS[payload.transaction.paymentMethod]
                : undefined,
            ),
          ),
          createElement(
            View,
            { style: styles.column },
            renderKeyValueLine(
              'Data da transacao',
              formatDate(payload.transaction.transactionDate),
            ),
            renderKeyValueLine(
              'Vencimento',
              payload.transaction.dueDate ? formatDate(payload.transaction.dueDate) : undefined,
            ),
            renderKeyValueLine('Referencia', payload.transaction.reference),
            renderKeyValueLine(
              'Pedido vinculado',
              payload.order ? payload.order.orderNumber : undefined,
            ),
          ),
        ),
        payload.transaction.notes
          ? renderKeyValueLine('Observacoes', payload.transaction.notes)
          : createElement(View),
      ),
      createElement(
        View,
        { style: styles.summaryBox },
        createElement(
          View,
          { style: [styles.summaryRow, styles.summaryTotal] },
          createElement(Text, { style: styles.strong }, 'Valor recebido'),
          createElement(
            Text,
            { style: styles.strong },
            formatCurrency(payload.summary.totalReceived),
          ),
        ),
      ),
      createElement(
        Text,
        { style: styles.footer },
        payload.profile.footer?.trim()
          ? payload.profile.footer
          : 'Documento gerado automaticamente pelo MeuPJ.',
      ),
    ),
  );

export const renderBudgetDocumentPdf = async (payload: BudgetDocumentPayload): Promise<Buffer> => {
  return renderToBuffer(
    renderCommercialDocument(payload, 'Orcamento', 'Proposta comercial referente ao pedido'),
  );
};

export const renderServiceOrderDocumentPdf = async (
  payload: ServiceOrderDocumentPayload,
): Promise<Buffer> => {
  return renderToBuffer(
    renderCommercialDocument(payload, 'Ordem de servico', 'Execucao vinculada ao pedido'),
  );
};

export const renderReceiptDocumentPdf = async (
  payload: ReceiptDocumentPayload,
): Promise<Buffer> => {
  return renderToBuffer(renderReceiptDocument(payload));
};
