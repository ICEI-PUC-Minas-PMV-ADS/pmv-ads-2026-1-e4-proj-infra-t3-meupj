import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { ClientStore } from '../lib/clients.js';
import {
  buildBudgetDocument,
  buildReceiptDocument,
  buildServiceOrderDocument,
} from '../lib/documents.js';
import {
  renderBudgetDocumentPdf,
  renderReceiptDocumentPdf,
  renderServiceOrderDocumentPdf,
} from '../lib/document-pdf.js';
import type { Order } from '../lib/orders.js';
import type { OrdersStore } from '../lib/orders.js';
import type { ProfileStore } from '../lib/profile.js';
import type { Transaction } from '../lib/transactions.js';
import type { TransactionsStore } from '../lib/transactions.js';

const UnauthorizedSchema = Type.Object({
  error: Type.Literal('Unauthorized'),
  message: Type.Literal('Unauthorized'),
  statusCode: Type.Literal(401),
});

const NotFoundSchema = Type.Object({
  error: Type.Literal('Not Found'),
  message: Type.Literal('Order not found'),
  statusCode: Type.Literal(404),
});

const ConflictSchema = Type.Object({
  error: Type.Literal('Conflict'),
  message: Type.String(),
  statusCode: Type.Literal(409),
});

const OrderParamsSchema = Type.Object(
  {
    orderId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
  },
  {
    additionalProperties: false,
  },
);

const TransactionParamsSchema = Type.Object(
  {
    transactionId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
  },
  {
    additionalProperties: false,
  },
);

const createCommercialDocumentResponseSchema = <TDocumentType extends 'budget' | 'serviceOrder'>(
  documentType: TDocumentType,
) =>
  Type.Object(
    {
      documentType: Type.Literal(documentType),
      generatedAt: Type.String({ format: 'date-time' }),
      profile: Type.Object({
        name: Type.Union([Type.String(), Type.Null()]),
        document: Type.Union([Type.String(), Type.Null()]),
        phone: Type.Union([Type.String(), Type.Null()]),
        email: Type.Union([Type.String(), Type.Null()]),
        footer: Type.Union([Type.String(), Type.Null()]),
        address: Type.Object({
          zipCode: Type.Union([Type.String(), Type.Null()]),
          street: Type.Union([Type.String(), Type.Null()]),
          number: Type.Union([Type.String(), Type.Null()]),
          complement: Type.Union([Type.String(), Type.Null()]),
          district: Type.Union([Type.String(), Type.Null()]),
          city: Type.Union([Type.String(), Type.Null()]),
          state: Type.Union([Type.String(), Type.Null()]),
          country: Type.Union([Type.String(), Type.Null()]),
        }),
      }),
      client: Type.Union([
        Type.Object({
          _id: Type.String(),
          name: Type.String(),
          type: Type.Union([Type.Literal('individual'), Type.Literal('company')]),
          document: Type.String(),
          email: Type.String(),
          phone: Type.String(),
          address: Type.Object({
            zipCode: Type.String(),
            street: Type.String(),
            number: Type.String(),
            complement: Type.Optional(Type.String()),
            district: Type.String(),
            city: Type.String(),
            state: Type.String(),
            country: Type.Optional(Type.String()),
          }),
        }),
        Type.Null(),
      ]),
      order: Type.Object({
        _id: Type.String(),
        orderNumber: Type.String(),
        reference: Type.Optional(Type.String()),
        status: Type.Union([
          Type.Literal('draft'),
          Type.Literal('pendingApproval'),
          Type.Literal('inProgress'),
          Type.Literal('completed'),
          Type.Literal('warranty'),
          Type.Literal('cancelled'),
        ]),
        createdAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),
        paymentTerms: Type.Optional(Type.String()),
        warrantyTerms: Type.Optional(Type.String()),
        additionalInfo: Type.Optional(Type.String()),
        items: Type.Array(
          Type.Object({
            catalogItemId: Type.String(),
            type: Type.Union([Type.Literal('product'), Type.Literal('service')]),
            name: Type.String(),
            description: Type.Optional(Type.String()),
            unitPrice: Type.Number(),
            unitMeasure: Type.String(),
            quantity: Type.Number(),
            subtotal: Type.Number(),
            position: Type.Number(),
          }),
        ),
      }),
      summary: Type.Object({
        itemsSubtotal: Type.Number(),
        discount: Type.Number(),
        fees: Type.Number(),
        total: Type.Number(),
      }),
    },
    {
      additionalProperties: false,
    },
  );

const BudgetDocumentResponseSchema = createCommercialDocumentResponseSchema('budget');
const ServiceOrderDocumentResponseSchema = createCommercialDocumentResponseSchema('serviceOrder');

const ReceiptDocumentResponseSchema = Type.Object(
  {
    documentType: Type.Literal('receipt'),
    generatedAt: Type.String({ format: 'date-time' }),
    profile: Type.Object({
      name: Type.Union([Type.String(), Type.Null()]),
      document: Type.Union([Type.String(), Type.Null()]),
      phone: Type.Union([Type.String(), Type.Null()]),
      email: Type.Union([Type.String(), Type.Null()]),
      footer: Type.Union([Type.String(), Type.Null()]),
      address: Type.Object({
        zipCode: Type.Union([Type.String(), Type.Null()]),
        street: Type.Union([Type.String(), Type.Null()]),
        number: Type.Union([Type.String(), Type.Null()]),
        complement: Type.Union([Type.String(), Type.Null()]),
        district: Type.Union([Type.String(), Type.Null()]),
        city: Type.Union([Type.String(), Type.Null()]),
        state: Type.Union([Type.String(), Type.Null()]),
        country: Type.Union([Type.String(), Type.Null()]),
      }),
    }),
    client: Type.Union([
      Type.Object({
        _id: Type.String(),
        name: Type.String(),
        type: Type.Union([Type.Literal('individual'), Type.Literal('company')]),
        document: Type.String(),
        email: Type.String(),
        phone: Type.String(),
        address: Type.Object({
          zipCode: Type.String(),
          street: Type.String(),
          number: Type.String(),
          complement: Type.Optional(Type.String()),
          district: Type.String(),
          city: Type.String(),
          state: Type.String(),
          country: Type.Optional(Type.String()),
        }),
      }),
      Type.Null(),
    ]),
    order: Type.Union([
      Type.Object({
        _id: Type.String(),
        orderNumber: Type.String(),
        reference: Type.Optional(Type.String()),
        status: Type.Union([
          Type.Literal('draft'),
          Type.Literal('pendingApproval'),
          Type.Literal('inProgress'),
          Type.Literal('completed'),
          Type.Literal('warranty'),
          Type.Literal('cancelled'),
        ]),
      }),
      Type.Null(),
    ]),
    transaction: Type.Object({
      _id: Type.String(),
      type: Type.Union([Type.Literal('income'), Type.Literal('expense')]),
      status: Type.Literal('confirmed'),
      paymentMethod: Type.Optional(
        Type.Union([
          Type.Literal('pix'),
          Type.Literal('cash'),
          Type.Literal('creditCard'),
          Type.Literal('debitCard'),
          Type.Literal('bankTransfer'),
          Type.Literal('bankSlip'),
        ]),
      ),
      amount: Type.Number(),
      transactionDate: Type.String({ format: 'date-time' }),
      dueDate: Type.Optional(Type.String({ format: 'date-time' })),
      category: Type.Optional(Type.String()),
      reference: Type.Optional(Type.String()),
      notes: Type.Optional(Type.String()),
      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),
    }),
    summary: Type.Object({
      totalReceived: Type.Number(),
    }),
  },
  {
    additionalProperties: false,
  },
);

const TransactionNotFoundSchema = Type.Object({
  error: Type.Literal('Not Found'),
  message: Type.Literal('Transaction not found'),
  statusCode: Type.Literal(404),
});

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

const NotFoundPayload = Object.freeze({
  error: 'Not Found',
  message: 'Order not found',
  statusCode: 404,
});

const TransactionNotFoundPayload = Object.freeze({
  error: 'Not Found',
  message: 'Transaction not found',
  statusCode: 404,
});

const CancelledBudgetPayload = Object.freeze({
  error: 'Conflict',
  message: 'Pedidos cancelados nao podem gerar orcamento.',
  statusCode: 409,
});

const InvalidServiceOrderPayload = Object.freeze({
  error: 'Conflict',
  message:
    'A ordem de servico so esta disponivel para pedidos em andamento, concluidos ou em garantia.',
  statusCode: 409,
});

const InvalidReceiptPayload = Object.freeze({
  error: 'Conflict',
  message: 'O recibo so esta disponivel para lancamentos confirmados.',
  statusCode: 409,
});

type DocumentOrderParams = Static<typeof OrderParamsSchema>;
type DocumentTransactionParams = Static<typeof TransactionParamsSchema>;

type ProfileScopedOrder = {
  order: (Order & { _id: ObjectId }) | null;
  profile: Awaited<ReturnType<ProfileStore['ensureByAuthUserId']>>;
  profileId: string;
};

type ProfileScopedTransaction = {
  profile: Awaited<ReturnType<ProfileStore['ensureByAuthUserId']>>;
  profileId: string;
  transaction: (Transaction & { _id: ObjectId }) | null;
};

export type DocumentsRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  ordersStore: OrdersStore;
  clientsStore: ClientStore;
  transactionsStore: TransactionsStore;
};

const canGenerateBudget = (status: Order['status']): boolean => status !== 'cancelled';

const canGenerateServiceOrder = (status: Order['status']): boolean =>
  status === 'inProgress' || status === 'completed' || status === 'warranty';

const canGenerateReceipt = (status: Transaction['status']): boolean => status === 'confirmed';

const getCommercialDocumentFileName = (prefix: string, orderNumber: string): string =>
  `${prefix}-${orderNumber}.pdf`;

const getReceiptFileName = (transactionId: string): string => `recibo-${transactionId}.pdf`;

export const registerDocumentsRoutes = (
  app: FastifyInstance,
  dependencies: DocumentsRouteDependencies,
): void => {
  const loadProfileScopedOrder = async (
    authUserId: string,
    orderId: string,
  ): Promise<ProfileScopedOrder> => {
    const profile = await dependencies.profileStore.ensureByAuthUserId(authUserId);
    const profileId = profile._id.toHexString();
    const order = await dependencies.ordersStore.getCollection().findOne({
      _id: new ObjectId(orderId),
      profileId,
    });

    return {
      order,
      profile,
      profileId,
    };
  };

  const loadProfileScopedClient = async (profileId: string, clientId?: string | null) => {
    if (!clientId) {
      return null;
    }

    return dependencies.clientsStore.getCollection().findOne({
      _id: new ObjectId(clientId),
      profileId,
    });
  };

  const loadProfileScopedTransaction = async (
    authUserId: string,
    transactionId: string,
  ): Promise<ProfileScopedTransaction> => {
    const profile = await dependencies.profileStore.ensureByAuthUserId(authUserId);
    const profileId = profile._id.toHexString();
    const transaction = await dependencies.transactionsStore.getCollection().findOne({
      _id: new ObjectId(transactionId),
      profileId,
    });

    return {
      profile,
      profileId,
      transaction,
    };
  };

  app.get(
    '/api/documents/budget/:orderId',
    {
      schema: {
        params: OrderParamsSchema,
        response: {
          200: BudgetDocumentResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as DocumentOrderParams;
      const { order, profile, profileId } = await loadProfileScopedOrder(
        session.user.id,
        params.orderId,
      );

      if (!order) {
        return reply.status(404).send(NotFoundPayload);
      }

      if (!canGenerateBudget(order.status)) {
        return reply.status(409).send(CancelledBudgetPayload);
      }

      const client = await loadProfileScopedClient(profileId, order.clientId);
      const payload = buildBudgetDocument(order, profile, client);

      return reply.status(200).send(payload);
    },
  );

  app.get(
    '/api/documents/budget/:orderId/pdf',
    {
      schema: {
        params: OrderParamsSchema,
        response: {
          200: Type.Any(),
          401: UnauthorizedSchema,
          404: NotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as DocumentOrderParams;
      const { order, profile, profileId } = await loadProfileScopedOrder(
        session.user.id,
        params.orderId,
      );

      if (!order) {
        return reply.status(404).send(NotFoundPayload);
      }

      if (!canGenerateBudget(order.status)) {
        return reply.status(409).send(CancelledBudgetPayload);
      }

      const client = await loadProfileScopedClient(profileId, order.clientId);
      const payload = buildBudgetDocument(order, profile, client);
      const pdfBuffer = await renderBudgetDocumentPdf(payload);

      reply.header(
        'Content-Disposition',
        `inline; filename="${getCommercialDocumentFileName('orcamento', order.orderNumber)}"`,
      );
      reply.header('Content-Type', 'application/pdf');

      return reply.status(200).send(pdfBuffer);
    },
  );

  app.get(
    '/api/documents/service-order/:orderId',
    {
      schema: {
        params: OrderParamsSchema,
        response: {
          200: ServiceOrderDocumentResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as DocumentOrderParams;
      const { order, profile, profileId } = await loadProfileScopedOrder(
        session.user.id,
        params.orderId,
      );

      if (!order) {
        return reply.status(404).send(NotFoundPayload);
      }

      if (!canGenerateServiceOrder(order.status)) {
        return reply.status(409).send(InvalidServiceOrderPayload);
      }

      const client = await loadProfileScopedClient(profileId, order.clientId);
      const payload = buildServiceOrderDocument(order, profile, client);

      return reply.status(200).send(payload);
    },
  );

  app.get(
    '/api/documents/service-order/:orderId/pdf',
    {
      schema: {
        params: OrderParamsSchema,
        response: {
          200: Type.Any(),
          401: UnauthorizedSchema,
          404: NotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as DocumentOrderParams;
      const { order, profile, profileId } = await loadProfileScopedOrder(
        session.user.id,
        params.orderId,
      );

      if (!order) {
        return reply.status(404).send(NotFoundPayload);
      }

      if (!canGenerateServiceOrder(order.status)) {
        return reply.status(409).send(InvalidServiceOrderPayload);
      }

      const client = await loadProfileScopedClient(profileId, order.clientId);
      const payload = buildServiceOrderDocument(order, profile, client);
      const pdfBuffer = await renderServiceOrderDocumentPdf(payload);

      reply.header(
        'Content-Disposition',
        `inline; filename="${getCommercialDocumentFileName('ordem-servico', order.orderNumber)}"`,
      );
      reply.header('Content-Type', 'application/pdf');

      return reply.status(200).send(pdfBuffer);
    },
  );

  app.get(
    '/api/documents/receipt/:transactionId',
    {
      schema: {
        params: TransactionParamsSchema,
        response: {
          200: ReceiptDocumentResponseSchema,
          401: UnauthorizedSchema,
          404: TransactionNotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as DocumentTransactionParams;
      const { transaction, profile, profileId } = await loadProfileScopedTransaction(
        session.user.id,
        params.transactionId,
      );

      if (!transaction) {
        return reply.status(404).send(TransactionNotFoundPayload);
      }

      if (!canGenerateReceipt(transaction.status)) {
        return reply.status(409).send(InvalidReceiptPayload);
      }

      const client = await loadProfileScopedClient(profileId, transaction.clientId);
      const order = transaction.orderId
        ? await dependencies.ordersStore.getCollection().findOne({
            _id: new ObjectId(transaction.orderId),
            profileId,
          })
        : null;

      const payload = buildReceiptDocument(transaction, profile, client, order);

      return reply.status(200).send(payload);
    },
  );

  app.get(
    '/api/documents/receipt/:transactionId/pdf',
    {
      schema: {
        params: TransactionParamsSchema,
        response: {
          200: Type.Any(),
          401: UnauthorizedSchema,
          404: TransactionNotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as DocumentTransactionParams;
      const { transaction, profile, profileId } = await loadProfileScopedTransaction(
        session.user.id,
        params.transactionId,
      );

      if (!transaction) {
        return reply.status(404).send(TransactionNotFoundPayload);
      }

      if (!canGenerateReceipt(transaction.status)) {
        return reply.status(409).send(InvalidReceiptPayload);
      }

      const client = await loadProfileScopedClient(profileId, transaction.clientId);
      const order = transaction.orderId
        ? await dependencies.ordersStore.getCollection().findOne({
            _id: new ObjectId(transaction.orderId),
            profileId,
          })
        : null;
      const payload = buildReceiptDocument(transaction, profile, client, order);
      const pdfBuffer = await renderReceiptDocumentPdf(payload);

      reply.header(
        'Content-Disposition',
        `inline; filename="${getReceiptFileName(transaction._id.toHexString())}"`,
      );
      reply.header('Content-Type', 'application/pdf');

      return reply.status(200).send(pdfBuffer);
    },
  );
};
