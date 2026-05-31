import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type WithId } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { ClientStore } from '../lib/clients.js';
import type { ProfileStore } from '../lib/profile.js';
import type { TransactionsStore, Transaction } from '../lib/transactions.js';

const PaymentMethodSchema = Type.Union([
  Type.Literal('pix'),
  Type.Literal('cash'),
  Type.Literal('creditCard'),
  Type.Literal('debitCard'),
  Type.Literal('bankTransfer'),
  Type.Literal('bankSlip'),
]);

const TransactionCreateSchema = Type.Object(
  {
    clientId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    orderId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    amount: Type.Number({ exclusiveMinimum: 0 }),
    transactionDate: Type.String({ format: 'date-time' }),
    dueDate: Type.Optional(Type.String({ format: 'date-time' })),
    paymentMethod: Type.Optional(PaymentMethodSchema),
    category: Type.Optional(Type.String()),
    reference: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
    status: Type.Optional(
      Type.Union([Type.Literal('pending'), Type.Literal('confirmed'), Type.Literal('cancelled')]),
    ),
  },
  {
    additionalProperties: false,
  },
);

const TransactionResponseSchemaBase = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    clientId: Type.Optional(Type.String()),
    orderId: Type.Optional(Type.String()),
    status: Type.Union([
      Type.Literal('pending'),
      Type.Literal('confirmed'),
      Type.Literal('cancelled'),
    ]),
    displayStatus: Type.Union([
      Type.Literal('pending'),
      Type.Literal('confirmed'),
      Type.Literal('cancelled'),
      Type.Literal('overdue'),
    ]),
    paymentMethod: Type.Optional(PaymentMethodSchema),
    amount: Type.Number(),
    transactionDate: Type.String({ format: 'date-time' }),
    dueDate: Type.Optional(Type.String({ format: 'date-time' })),
    category: Type.Optional(Type.String()),
    reference: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  {
    additionalProperties: false,
  },
);

const TransactionIncomeResponseSchema = Type.Intersect([
  TransactionResponseSchemaBase,
  Type.Object({
    type: Type.Literal('income'),
  }),
]);

const TransactionExpenseResponseSchema = Type.Intersect([
  TransactionResponseSchemaBase,
  Type.Object({
    type: Type.Literal('expense'),
  }),
]);

const UnauthorizedSchema = Type.Object({
  error: Type.Literal('Unauthorized'),
  message: Type.Literal('Unauthorized'),
  statusCode: Type.Literal(401),
});

const BadRequestSchema = Type.Object({
  error: Type.Literal('Bad Request'),
  message: Type.String(),
  statusCode: Type.Literal(400),
});

const NotFoundSchema = Type.Object({
  error: Type.Literal('Not Found'),
  message: Type.Literal('Transaction not found'),
  statusCode: Type.Literal(404),
});

const ConflictSchema = Type.Object({
  error: Type.Literal('Conflict'),
  message: Type.Literal('Confirmed transaction cannot be deleted'),
  statusCode: Type.Literal(409),
});

const TransactionParamsSchema = Type.Object(
  {
    transactionId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
  },
  {
    additionalProperties: false,
  },
);

const TransactionUpdateSchema = Type.Object(
  {
    clientId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    orderId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    amount: Type.Optional(Type.Number({ exclusiveMinimum: 0 })),
    transactionDate: Type.Optional(Type.String({ format: 'date-time' })),
    dueDate: Type.Optional(Type.String({ format: 'date-time' })),
    paymentMethod: Type.Optional(PaymentMethodSchema),
    category: Type.Optional(Type.String()),
    reference: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
    status: Type.Optional(Type.Union([
      Type.Literal('pending'),
      Type.Literal('confirmed'),
      Type.Literal('cancelled'),
    ])),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

const TransactionResponseSchema = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    type: Type.Union([Type.Literal('income'), Type.Literal('expense')]),
    clientId: Type.Optional(Type.String()),
    orderId: Type.Optional(Type.String()),
    status: Type.Union([
      Type.Literal('pending'),
      Type.Literal('confirmed'),
      Type.Literal('cancelled'),
    ]),
    displayStatus: Type.Union([
      Type.Literal('pending'),
      Type.Literal('confirmed'),
      Type.Literal('cancelled'),
      Type.Literal('overdue'),
    ]),
    paymentMethod: Type.Optional(PaymentMethodSchema),
    amount: Type.Number(),
    transactionDate: Type.String({ format: 'date-time' }),
    dueDate: Type.Optional(Type.String({ format: 'date-time' })),
    category: Type.Optional(Type.String()),
    reference: Type.Optional(Type.String()),
    notes: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  {
    additionalProperties: false,
  },
);

const TransactionSortBySchema = Type.Union([
  Type.Literal('createdAt'),
  Type.Literal('transactionDate'),
  Type.Literal('amount'),
]);

const TransactionSortOrderSchema = Type.Union([Type.Literal('asc'), Type.Literal('desc')]);

const TransactionListQuerySchema = Type.Object(
  {
    page: Type.Optional(Type.Any()),
    limit: Type.Optional(Type.Any()),
    q: Type.Optional(Type.String()),
    type: Type.Optional(Type.Union([Type.Literal('income'), Type.Literal('expense')])),
    status: Type.Optional(Type.Union([
      Type.Literal('pending'),
      Type.Literal('confirmed'),
      Type.Literal('cancelled'),
    ])),
    clientId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    orderId: Type.Optional(Type.String({ pattern: '^[a-fA-F0-9]{24}$' })),
    paymentMethod: Type.Optional(PaymentMethodSchema),
    category: Type.Optional(Type.String()),
    transactionFrom: Type.Optional(Type.String({ format: 'date-time' })),
    transactionTo: Type.Optional(Type.String({ format: 'date-time' })),
    createdFrom: Type.Optional(Type.String({ format: 'date-time' })),
    createdTo: Type.Optional(Type.String({ format: 'date-time' })),
    sortBy: Type.Optional(TransactionSortBySchema),
    sortOrder: Type.Optional(TransactionSortOrderSchema),
  },
  {
    additionalProperties: false,
  },
);

const TransactionListResponseSchema = Type.Object(
  {
    data: Type.Array(
      Type.Object({
        _id: Type.String(),
        profileId: Type.String(),
        type: Type.Union([Type.Literal('income'), Type.Literal('expense')]),
        clientId: Type.Optional(Type.String()),
        orderId: Type.Optional(Type.String()),
        status: Type.Union([
          Type.Literal('pending'),
          Type.Literal('confirmed'),
          Type.Literal('cancelled'),
        ]),
        displayStatus: Type.Union([
          Type.Literal('pending'),
          Type.Literal('confirmed'),
          Type.Literal('cancelled'),
          Type.Literal('overdue'),
        ]),
        paymentMethod: Type.Optional(PaymentMethodSchema),
        amount: Type.Number(),
        transactionDate: Type.String({ format: 'date-time' }),
        dueDate: Type.Optional(Type.String({ format: 'date-time' })),
        category: Type.Optional(Type.String()),
        reference: Type.Optional(Type.String()),
        notes: Type.Optional(Type.String()),
        createdAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),
      }),
    ),
    total: Type.Integer({ minimum: 0 }),
    page: Type.Integer({ minimum: 1 }),
    limit: Type.Integer({ minimum: 1 }),
  },
  {
    additionalProperties: false,
  },
);

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

const NotFoundPayload = Object.freeze({
  error: 'Not Found',
  message: 'Transaction not found',
  statusCode: 404,
});

const ConflictPayload = Object.freeze({
  error: 'Conflict',
  message: 'Confirmed transaction cannot be deleted',
  statusCode: 409,
});

const transactionToResponse = (transaction: WithId<Transaction>) => {
  const isOverdue =
    transaction.status === 'pending' &&
    transaction.dueDate !== undefined &&
    transaction.dueDate < new Date();

  return {
    ...transaction,
    _id: transaction._id.toHexString(),
    transactionDate: transaction.transactionDate.toISOString(),
    dueDate: transaction.dueDate ? transaction.dueDate.toISOString() : undefined,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    displayStatus: isOverdue ? 'overdue' as const : transaction.status,
  };
};

const validateClientOwnership = async (
  clientId: string,
  profileId: string,
  clientsStore: ClientStore,
) => {
  const client = await clientsStore.getCollection().findOne({
    _id: new ObjectId(clientId),
    profileId,
  });

  return Boolean(client);
};

const buildTransactionDocument = (
  body: TransactionCreateBody,
  profileId: string,
  type: 'income' | 'expense',
  now: Date,
) => ({
  profileId,
  ...(body.orderId !== undefined && { orderId: body.orderId }),
  ...(body.clientId !== undefined && { clientId: body.clientId }),
  type,
  status: body.status ?? ('pending' as const),
  ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod }),
  amount: body.amount,
  transactionDate: new Date(body.transactionDate),
  ...(body.dueDate !== undefined && { dueDate: new Date(body.dueDate) }),
  ...(body.category !== undefined && { category: body.category }),
  ...(body.reference !== undefined && { reference: body.reference }),
  ...(body.notes !== undefined && { notes: body.notes }),
  createdAt: now,
  updatedAt: now,
});

type TransactionCreateBody = Static<typeof TransactionCreateSchema>;

type TransactionUpdateBody = Static<typeof TransactionUpdateSchema>;

type TransactionParams = Static<typeof TransactionParamsSchema>;

export type TransactionsRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  clientsStore: ClientStore;
  transactionsStore: TransactionsStore;
};

export const registerTransactionsRoutes = (
  app: FastifyInstance,
  dependencies: TransactionsRouteDependencies,
): void => {
  app.post(
    '/api/transactions/income',
    {
      schema: {
        body: TransactionCreateSchema,
        response: {
          201: TransactionIncomeResponseSchema,
          400: BadRequestSchema,
          401: UnauthorizedSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }
      const body = request.body as TransactionCreateBody;

      if (body.clientId) {
        const validClient = await validateClientOwnership(body.clientId, profileId, dependencies.clientsStore);

        if (!validClient) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Client not found or does not belong to this profile',
            statusCode: 400,
          });
        }
      }

      const now = new Date();
      const transactionDocument = buildTransactionDocument(body, profileId, 'income', now);

      const collection = dependencies.transactionsStore.getCollection();
      const insertResult = await collection.insertOne(transactionDocument);
      const createdTransaction = await collection.findOne({ _id: insertResult.insertedId });

      if (!createdTransaction) {
        throw new Error('Failed to fetch created transaction');
      }

      return reply.status(201).send(transactionToResponse(createdTransaction));
    },
  );

  app.post(
    '/api/transactions/expense',
    {
      schema: {
        body: TransactionCreateSchema,
        response: {
          201: TransactionExpenseResponseSchema,
          400: BadRequestSchema,
          401: UnauthorizedSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }
      const body = request.body as TransactionCreateBody;

      if (body.clientId) {
        const validClient = await validateClientOwnership(body.clientId, profileId, dependencies.clientsStore);

        if (!validClient) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Client not found or does not belong to this profile',
            statusCode: 400,
          });
        }
      }

      const now = new Date();
      const transactionDocument = buildTransactionDocument(body, profileId, 'expense', now);

      const collection = dependencies.transactionsStore.getCollection();
      const insertResult = await collection.insertOne(transactionDocument);
      const createdTransaction = await collection.findOne({ _id: insertResult.insertedId });

      if (!createdTransaction) {
        throw new Error('Failed to fetch created transaction');
      }

      return reply.status(201).send(transactionToResponse(createdTransaction));
    },
  );

  app.get(
    '/api/transactions/:transactionId',
    {
      schema: {
        params: TransactionParamsSchema,
        response: {
          200: TransactionResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }

      const params = request.params as TransactionParams;
      const transactionObjectId = new ObjectId(params.transactionId);
      const collection = dependencies.transactionsStore.getCollection();

      const transaction = await collection.findOne({
        _id: transactionObjectId,
        profileId,
      });

      if (!transaction) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(transactionToResponse(transaction));
    },
  );

  app.get(
    '/api/transactions',
    {
      schema: {
        querystring: TransactionListQuerySchema,
        response: {
          200: TransactionListResponseSchema,
          401: UnauthorizedSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }

      const query = request.query as any;

      const page = Math.max(1, parseInt(query.page ?? '1', 10));
      const limit = Math.max(1, parseInt(query.limit ?? '20', 10));
      const sortBy = query.sortBy ?? 'createdAt';
      const sortOrder = query.sortOrder ?? 'desc';
      const skip = (page - 1) * limit;

      const filter: Record<string, object | string | undefined> = { profileId };

      if (query.type) {
        filter.type = query.type;
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.clientId) {
        filter.clientId = query.clientId;
      }

      if (query.orderId) {
        filter.orderId = query.orderId;
      }

      if (query.paymentMethod) {
        filter.paymentMethod = query.paymentMethod;
      }

      if (query.category) {
        filter.category = query.category;
      }

      if (query.transactionFrom || query.transactionTo) {
        const dateFilter: { $gte?: Date; $lte?: Date } = {};
        if (query.transactionFrom) {
          dateFilter.$gte = new Date(query.transactionFrom);
        }
        if (query.transactionTo) {
          dateFilter.$lte = new Date(query.transactionTo);
        }
        filter.transactionDate = dateFilter;
      }

      if (query.createdFrom || query.createdTo) {
        const dateFilter: { $gte?: Date; $lte?: Date } = {};
        if (query.createdFrom) {
          dateFilter.$gte = new Date(query.createdFrom);
        }
        if (query.createdTo) {
          dateFilter.$lte = new Date(query.createdTo);
        }
        filter.createdAt = dateFilter;
      }

      if (query.q && query.q.trim().length > 0) {
        const normalizedQuery = query.q.trim();
        filter.$or = [
          { reference: { $regex: normalizedQuery, $options: 'i' } },
          { category: { $regex: normalizedQuery, $options: 'i' } },
          { notes: { $regex: normalizedQuery, $options: 'i' } },
        ];
      }

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortDirection } as Record<string, 1 | -1>;

      const collection = dependencies.transactionsStore.getCollection();

      const [documents, total] = await Promise.all([
        collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);

      const response = {
        data: documents.map((doc) => transactionToResponse(doc)),
        total,
        page,
        limit,
      };

      return reply.status(200).send(response);
    },
  );

  app.put(
    '/api/transactions/:transactionId',
    {
      schema: {
        params: TransactionParamsSchema,
        body: TransactionUpdateSchema,
        response: {
          200: TransactionResponseSchema,
          400: BadRequestSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }

      const params = request.params as TransactionParams;
      const body = request.body as TransactionUpdateBody;
      const transactionObjectId = new ObjectId(params.transactionId);

      if (body.clientId) {
        const validClient = await validateClientOwnership(body.clientId, profileId, dependencies.clientsStore);

        if (!validClient) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'Client not found or does not belong to this profile',
            statusCode: 400,
          });
        }
      }

      const collection = dependencies.transactionsStore.getCollection();
      const existingTransaction = await collection.findOne({
        _id: transactionObjectId,
        profileId,
      });

      if (!existingTransaction) {
        return reply.status(404).send(NotFoundPayload);
      }

      const now = new Date();
      const setPayload: Partial<Transaction> = {
        updatedAt: now,
        ...(body.clientId !== undefined && { clientId: body.clientId }),
        ...(body.orderId !== undefined && { orderId: body.orderId }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.transactionDate !== undefined && { transactionDate: new Date(body.transactionDate) }),
        ...(body.dueDate !== undefined && { dueDate: new Date(body.dueDate) }),
        ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.reference !== undefined && { reference: body.reference }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status !== undefined && { status: body.status }),
      };

      await collection.updateOne(
        {
          _id: transactionObjectId,
          profileId,
        },
        {
          $set: setPayload,
        },
      );

      const updatedTransaction = await collection.findOne({
        _id: transactionObjectId,
        profileId,
      });

      if (!updatedTransaction) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(transactionToResponse(updatedTransaction));
    },
  );

  app.delete(
    '/api/transactions/:transactionId',
    {
      schema: {
        params: TransactionParamsSchema,
        response: {
          204: Type.Null(),
          401: UnauthorizedSchema,
          404: NotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }

      const params = request.params as TransactionParams;
      const transactionObjectId = new ObjectId(params.transactionId);
      const collection = dependencies.transactionsStore.getCollection();

      const existingTransaction = await collection.findOne({
        _id: transactionObjectId,
        profileId,
      });

      if (!existingTransaction) {
        return reply.status(404).send(NotFoundPayload);
      }

      if (existingTransaction.status === 'confirmed') {
        return reply.status(409).send(ConflictPayload);
      }

      const deleteResult = await collection.deleteOne({
        _id: transactionObjectId,
        profileId,
      });

      if (deleteResult.deletedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(204).send();
    },
  );

  app.patch(
    '/api/transactions/:transactionId/confirm',
    {
      schema: {
        params: TransactionParamsSchema,
        response: {
          200: TransactionResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      // Temporary bypass for local development testing
      let profileId: string;
      if (!session) {
        if (app.env.ENABLE_DEV_BYPASS === 'true') {
          // Fallback to a fixed profile or ensure one exists for development
          const fallbackProfile = await dependencies.profileStore.ensureByAuthUserId('dev-user-id');
          profileId = fallbackProfile._id.toHexString();
          app.log.warn('Bypassing authentication for local transaction testing');
        } else {
          return reply.status(401).send(UnauthorizedPayload);
        }
      } else {
        const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
        profileId = profile._id.toHexString();
      }

      const params = request.params as TransactionParams;
      const transactionObjectId = new ObjectId(params.transactionId);
      const collection = dependencies.transactionsStore.getCollection();

      const existingTransaction = await collection.findOne({
        _id: transactionObjectId,
        profileId,
      });

      if (!existingTransaction) {
        return reply.status(404).send(NotFoundPayload);
      }

      if (existingTransaction.status !== 'confirmed') {
        await collection.updateOne(
          {
            _id: transactionObjectId,
            profileId,
          },
          {
            $set: {
              status: 'confirmed',
              updatedAt: new Date(),
            },
          },
        );
      }

      const confirmedTransaction = await collection.findOne({
        _id: transactionObjectId,
        profileId,
      });

      if (!confirmedTransaction) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(transactionToResponse(confirmedTransaction));
    },
  );
};
