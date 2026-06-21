import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type WithId } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { CatalogStore } from '../lib/catalog.js';
import type { ClientStore } from '../lib/clients.js';
import type { CountersStore } from '../lib/counters.js';
import {
  LIMIT_DEFAULT,
  MAX_LIMIT,
  MAX_PAGE,
  PAGE_DEFAULT,
  PositiveIntegerStringSchema,
  toBoundedPositiveInteger,
} from '../lib/pagination.js';
import {
  isValidOrderStatusTransition,
  type Order,
  type OrderItemSnapshot,
  type OrderStatus,
  type OrdersStore,
  type PaymentMethod,
} from '../lib/orders.js';
import type { ProfileStore } from '../lib/profile.js';
import type { TransactionsStore } from '../lib/transactions.js';
import { resolveAuthenticatedProfileId } from './auth-session.js';

export type OrdersRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  catalogStore: CatalogStore;
  clientsStore: ClientStore;
  ordersStore: OrdersStore;
  countersStore: CountersStore;
  transactionsStore: TransactionsStore;
};

const PaymentMethodSchema = Type.Union([
  Type.Literal('pix'),
  Type.Literal('cash'),
  Type.Literal('creditCard'),
  Type.Literal('debitCard'),
  Type.Literal('bankTransfer'),
  Type.Literal('bankSlip'),
]);

const OrderStatusSchema = Type.Union([
  Type.Literal('draft'),
  Type.Literal('pendingApproval'),
  Type.Literal('inProgress'),
  Type.Literal('completed'),
  Type.Literal('warranty'),
  Type.Literal('cancelled'),
]);

const OrderItemCreateSchema = Type.Object(
  {
    catalogItemId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
    quantity: Type.Number({ exclusiveMinimum: 0 }),
  },
  {
    additionalProperties: false,
  },
);

const PaymentScheduleSchema = Type.Object(
  {
    amount: Type.Number({ exclusiveMinimum: 0 }),
    dueDate: Type.String({ format: 'date-time' }),
    paymentMethod: Type.Optional(PaymentMethodSchema),
  },
  {
    additionalProperties: false,
  },
);

const OrderCreateSchema = Type.Object(
  {
    clientId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    items: Type.Array(OrderItemCreateSchema, { minItems: 1 }),
    discount: Type.Optional(Type.Number()),
    fees: Type.Optional(Type.Number()),
    paymentMethods: Type.Optional(Type.Array(PaymentMethodSchema)),
    paymentSchedule: Type.Optional(Type.Array(PaymentScheduleSchema)),
    status: Type.Optional(OrderStatusSchema),
    reference: Type.Optional(Type.String()),
    paymentTerms: Type.Optional(Type.String()),
    warrantyTerms: Type.Optional(Type.String()),
    additionalInfo: Type.Optional(Type.String()),
    internalNotes: Type.Optional(Type.String()),
  },
  {
    additionalProperties: false,
  },
);

const OrderUpdateSchema = Type.Object(
  {
    clientId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    items: Type.Optional(Type.Array(OrderItemCreateSchema, { minItems: 1 })),
    discount: Type.Optional(Type.Number()),
    fees: Type.Optional(Type.Number()),
    paymentMethods: Type.Optional(Type.Array(PaymentMethodSchema)),
    status: Type.Optional(OrderStatusSchema),
    reference: Type.Optional(Type.String()),
    paymentTerms: Type.Optional(Type.String()),
    warrantyTerms: Type.Optional(Type.String()),
    additionalInfo: Type.Optional(Type.String()),
    internalNotes: Type.Optional(Type.String()),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

const OrderParamsSchema = Type.Object(
  {
    orderId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
  },
  {
    additionalProperties: false,
  },
);

const OrderResponseSchema = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    clientId: Type.Union([Type.String(), Type.Null()]),
    clientName: Type.Optional(Type.String()),
    orderNumber: Type.String(),
    reference: Type.Optional(Type.String()),
    status: OrderStatusSchema,
    paymentMethods: Type.Array(PaymentMethodSchema),
    items: Type.Array(
      Type.Object({
        catalogItemId: Type.String(),
        type: Type.String(),
        name: Type.String(),
        description: Type.Optional(Type.String()),
        unitPrice: Type.Number(),
        unitMeasure: Type.String(),
        quantity: Type.Number(),
        subtotal: Type.Number(),
        position: Type.Number(),
      }),
    ),
    discount: Type.Optional(Type.Number()),
    fees: Type.Optional(Type.Number()),
    total: Type.Number(),
    paymentTerms: Type.Optional(Type.String()),
    warrantyTerms: Type.Optional(Type.String()),
    additionalInfo: Type.Optional(Type.String()),
    internalNotes: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  {
    additionalProperties: true, // simplified for returning Order type directly
  },
);

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
  message: Type.Literal('Order not found'),
  statusCode: Type.Literal(404),
});

const ConflictSchema = Type.Object({
  error: Type.Literal('Conflict'),
  message: Type.String(),
  statusCode: Type.Literal(409),
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

const ConflictPayload = Object.freeze({
  error: 'Conflict',
  message: 'Order has confirmed transactions and cannot be deleted',
  statusCode: 409,
});

type OrderCreateBody = Static<typeof OrderCreateSchema>;
type OrderUpdateBody = Static<typeof OrderUpdateSchema>;
type OrderParams = Static<typeof OrderParamsSchema>;
type OrderResponse = Static<typeof OrderResponseSchema>;

const OrderSortBySchema = Type.Union([
  Type.Literal('createdAt'),
  Type.Literal('orderNumber'),
  Type.Literal('total'),
]);

const OrderSortOrderSchema = Type.Union([Type.Literal('asc'), Type.Literal('desc')]);

const OrderListQuerySchema = Type.Object(
  {
    page: Type.Optional(
      Type.Union([Type.Integer({ minimum: 1, maximum: MAX_PAGE }), PositiveIntegerStringSchema]),
    ),
    limit: Type.Optional(
      Type.Union([Type.Integer({ minimum: 1, maximum: MAX_LIMIT }), PositiveIntegerStringSchema]),
    ),
    q: Type.Optional(Type.String()),
    clientId: Type.Optional(Type.String()),
    status: Type.Optional(OrderStatusSchema),
    createdFrom: Type.Optional(Type.String({ format: 'date-time' })),
    createdTo: Type.Optional(Type.String({ format: 'date-time' })),
    sortBy: Type.Optional(OrderSortBySchema),
    sortOrder: Type.Optional(OrderSortOrderSchema),
  },
  {
    additionalProperties: false,
  },
);

const OrderListResponseSchema = Type.Object(
  {
    data: Type.Array(OrderResponseSchema),
    total: Type.Integer({ minimum: 0 }),
    page: Type.Integer({ minimum: 1 }),
    limit: Type.Integer({ minimum: 1 }),
  },
  {
    additionalProperties: false,
  },
);

type OrderListQuery = Static<typeof OrderListQuerySchema>;

const buildClientNameMap = async (
  clientsStore: ClientStore,
  profileId: string,
  clientIds: string[],
): Promise<Map<string, string>> => {
  const uniqueClientIds = Array.from(new Set(clientIds)).filter((clientId) => clientId.length > 0);

  if (uniqueClientIds.length === 0) {
    return new Map();
  }

  const clientObjectIds = uniqueClientIds.map((clientId) => new ObjectId(clientId));
  const clients = await clientsStore
    .getCollection()
    .find({
      _id: { $in: clientObjectIds },
      profileId,
    })
    .toArray();

  return new Map(clients.map((client) => [client._id.toHexString(), client.name]));
};

const serializeOrder = (
  order: WithId<Order>,
  clientNameMap: Map<string, string>,
): OrderResponse => ({
  ...order,
  _id: order._id.toHexString(),
  ...(order.clientId ? { clientName: clientNameMap.get(order.clientId) } : {}),
  createdAt: order.createdAt.toISOString(),
  updatedAt: order.updatedAt.toISOString(),
});

export const registerOrdersRoutes = (
  app: FastifyInstance,
  dependencies: OrdersRouteDependencies,
): void => {
  const getAuthenticatedProfileId = (
    headers: Parameters<AuthService['getSessionFromHeaders']>[0],
  ) => resolveAuthenticatedProfileId(app, dependencies, headers);

  app.get(
    '/api/orders',
    {
      schema: {
        querystring: OrderListQuerySchema,
        response: {
          200: OrderListResponseSchema,
          401: UnauthorizedSchema,
        },
      },
    },
    async (request, reply) => {
      const profileId = await getAuthenticatedProfileId(request.headers);

      if (!profileId) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const query = request.query as OrderListQuery;

      const page = toBoundedPositiveInteger(query.page, PAGE_DEFAULT, MAX_PAGE);
      const limit = toBoundedPositiveInteger(query.limit, LIMIT_DEFAULT, MAX_LIMIT);
      const sortBy = query.sortBy ?? 'createdAt';
      const sortOrder = query.sortOrder ?? 'desc';
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = { profileId };

      if (query.clientId) {
        filter.clientId = query.clientId;
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.createdFrom || query.createdTo) {
        filter.createdAt = {};
        if (query.createdFrom) {
          filter.createdAt.$gte = new Date(query.createdFrom);
        }
        if (query.createdTo) {
          filter.createdAt.$lte = new Date(query.createdTo);
        }
      }

      if (query.q && query.q.trim().length > 0) {
        const normalizedQuery = query.q.trim();
        filter.$or = [
          { orderNumber: { $regex: normalizedQuery, $options: 'i' } },
          { reference: { $regex: normalizedQuery, $options: 'i' } },
          { 'items.name': { $regex: normalizedQuery, $options: 'i' } },
        ];
      }

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortDirection } as Record<string, 1 | -1>;

      const collection = dependencies.ordersStore.getCollection();

      const [documents, total] = await Promise.all([
        collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);
      const clientNameMap = await buildClientNameMap(
        dependencies.clientsStore,
        profileId,
        documents.flatMap((document) => (document.clientId ? [document.clientId] : [])),
      );

      const response = {
        data: documents.map((document) => serializeOrder(document, clientNameMap)),
        total,
        page,
        limit,
      };

      return reply.status(200).send(response);
    },
  );

  app.post(
    '/api/orders',
    {
      schema: {
        body: OrderCreateSchema,
        response: {
          201: OrderResponseSchema,
          400: BadRequestSchema,
          401: UnauthorizedSchema,
        },
      },
    },
    async (request, reply) => {
      const profileId = await getAuthenticatedProfileId(request.headers);

      if (!profileId) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const body = request.body as OrderCreateBody;

      const itemIds = body.items.map((i) => new ObjectId(i.catalogItemId));
      const catalogCollection = dependencies.catalogStore.getCollection();

      const foundCatalogItems = await catalogCollection
        .find({
          _id: { $in: itemIds },
          profileId,
        })
        .toArray();

      if (foundCatalogItems.length !== body.items.length) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'One or more catalog items were not found or do not belong to this profile',
          statusCode: 400,
        });
      }

      let calculcatedItemsTotal = 0;
      const orderItemsSnapshot = body.items.map((payloadItem, index) => {
        const catalogData = foundCatalogItems.find(
          (c) => c._id.toHexString() === payloadItem.catalogItemId,
        );
        if (!catalogData) {
          throw new Error('Inconsistent catalog items lookup');
        }

        const subtotal = catalogData.unitPrice * payloadItem.quantity;
        calculcatedItemsTotal += subtotal;

        const itemSnapshot: any = {
          catalogItemId: payloadItem.catalogItemId,
          type: catalogData.type,
          name: catalogData.name,
          unitPrice: catalogData.unitPrice,
          unitMeasure: catalogData.unitMeasure,
          quantity: payloadItem.quantity,
          subtotal,
          position: index,
        };

        if (catalogData.description !== undefined) {
          itemSnapshot.description = catalogData.description;
        }

        return itemSnapshot as OrderItemSnapshot;
      });

      const startTotal = calculcatedItemsTotal;
      const discount = body.discount ?? 0;
      const fees = body.fees ?? 0;
      const finalTotal = startTotal - discount + fees;

      const orderNumberStr = await dependencies.countersStore.generateOrderNumber(profileId);

      const now = new Date();

      const orderDocument = {
        profileId,
        clientId: body.clientId ?? null,
        orderNumber: orderNumberStr,
        status: (body.status ?? 'draft') as OrderStatus,
        paymentMethods: (body.paymentMethods ?? []) as PaymentMethod[],
        items: orderItemsSnapshot,
        total: finalTotal,
        createdAt: now,
        updatedAt: now,
        ...(body.discount !== undefined && { discount: body.discount }),
        ...(body.fees !== undefined && { fees: body.fees }),
        ...(body.reference !== undefined && { reference: body.reference }),
        ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms }),
        ...(body.warrantyTerms !== undefined && { warrantyTerms: body.warrantyTerms }),
        ...(body.additionalInfo !== undefined && { additionalInfo: body.additionalInfo }),
        ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes }),
      };

      const ordersCollection = dependencies.ordersStore.getCollection();
      const insertOrderResult = await ordersCollection.insertOne(orderDocument);
      const insertedOrderId = insertOrderResult.insertedId.toHexString();

      if (body.paymentSchedule && body.paymentSchedule.length > 0) {
        const transactionsCollection = dependencies.transactionsStore.getCollection();
        const transactions = body.paymentSchedule.map((schedule) => ({
          profileId,
          orderId: insertedOrderId,
          type: 'income' as const,
          status: 'pending' as const,
          amount: schedule.amount,
          transactionDate: new Date(schedule.dueDate),
          dueDate: new Date(schedule.dueDate),
          createdAt: now,
          updatedAt: now,
          ...(schedule.paymentMethod !== undefined && { paymentMethod: schedule.paymentMethod }),
        }));

        await transactionsCollection.insertMany(transactions);
      }

      const createdOrder = await ordersCollection.findOne({ _id: insertOrderResult.insertedId });

      if (!createdOrder) {
        throw new Error('Failed to fetch just created order');
      }

      const clientNameMap = await buildClientNameMap(
        dependencies.clientsStore,
        profileId,
        createdOrder.clientId ? [createdOrder.clientId] : [],
      );

      return reply.status(201).send(serializeOrder(createdOrder, clientNameMap));
    },
  );

  app.get(
    '/api/orders/:orderId',
    {
      schema: {
        params: OrderParamsSchema,
        response: {
          200: OrderResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const profileId = await getAuthenticatedProfileId(request.headers);

      if (!profileId) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as OrderParams;
      const orderObjectId = new ObjectId(params.orderId);
      const collection = dependencies.ordersStore.getCollection();

      const order = await collection.findOne({
        _id: orderObjectId,
        profileId,
      });

      if (!order) {
        return reply.status(404).send(NotFoundPayload);
      }

      const clientNameMap = await buildClientNameMap(
        dependencies.clientsStore,
        profileId,
        order.clientId ? [order.clientId] : [],
      );

      return reply.status(200).send(serializeOrder(order, clientNameMap));
    },
  );

  app.put(
    '/api/orders/:orderId',
    {
      schema: {
        params: OrderParamsSchema,
        body: OrderUpdateSchema,
        response: {
          200: OrderResponseSchema,
          400: BadRequestSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
          409: ConflictSchema,
        },
      },
    },
    async (request, reply) => {
      const profileId = await getAuthenticatedProfileId(request.headers);

      if (!profileId) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const params = request.params as OrderParams;
      const orderObjectId = new ObjectId(params.orderId);
      const body = request.body as OrderUpdateBody;

      const ordersCollection = dependencies.ordersStore.getCollection();
      const existingOrder = await ordersCollection.findOne({
        _id: orderObjectId,
        profileId,
      });

      if (!existingOrder) {
        return reply.status(404).send(NotFoundPayload);
      }

      let orderItemsSnapshot = existingOrder.items;
      let calculatedItemsTotal = existingOrder.items.reduce((acc, curr) => acc + curr.subtotal, 0);

      if (body.items) {
        const itemIds = body.items.map((i) => new ObjectId(i.catalogItemId));
        const catalogCollection = dependencies.catalogStore.getCollection();

        const foundCatalogItems = await catalogCollection
          .find({
            _id: { $in: itemIds },
            profileId,
          })
          .toArray();

        if (foundCatalogItems.length !== body.items.length) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'One or more catalog items were not found or do not belong to this profile',
            statusCode: 400,
          });
        }

        calculatedItemsTotal = 0;
        orderItemsSnapshot = body.items.map((payloadItem, index) => {
          const catalogData = foundCatalogItems.find(
            (c) => c._id.toHexString() === payloadItem.catalogItemId,
          );
          if (!catalogData) {
            throw new Error('Inconsistent catalog items lookup');
          }

          const subtotal = catalogData.unitPrice * payloadItem.quantity;
          calculatedItemsTotal += subtotal;

          const itemSnapshot: any = {
            catalogItemId: payloadItem.catalogItemId,
            type: catalogData.type,
            name: catalogData.name,
            unitPrice: catalogData.unitPrice,
            unitMeasure: catalogData.unitMeasure,
            quantity: payloadItem.quantity,
            subtotal,
            position: index,
          };

          if (catalogData.description !== undefined) {
            itemSnapshot.description = catalogData.description;
          }

          return itemSnapshot as OrderItemSnapshot;
        });
      }

      if (body.status !== undefined && body.status !== existingOrder.status) {
        const isTransitionValid = isValidOrderStatusTransition(existingOrder.status, body.status);
        if (!isTransitionValid) {
          return reply.status(409).send({
            error: 'Conflict',
            message: `Invalid status transition from '${existingOrder.status}' to '${body.status}'`,
            statusCode: 409,
          });
        }
      }

      const activeDiscount = body.discount ?? existingOrder.discount ?? 0;
      const activeFees = body.fees ?? existingOrder.fees ?? 0;
      const finalTotal = calculatedItemsTotal - activeDiscount + activeFees;

      const now = new Date();

      const setPayload: Partial<typeof existingOrder> = {
        updatedAt: now,
        ...((body.items || body.discount !== undefined || body.fees !== undefined) && {
          total: finalTotal,
        }),
        ...(body.items !== undefined && { items: orderItemsSnapshot }),
        ...(body.clientId !== undefined && { clientId: body.clientId }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.discount !== undefined && { discount: body.discount }),
        ...(body.fees !== undefined && { fees: body.fees }),
        ...(body.paymentMethods !== undefined && { paymentMethods: body.paymentMethods }),
        ...(body.reference !== undefined && { reference: body.reference }),
        ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms }),
        ...(body.warrantyTerms !== undefined && { warrantyTerms: body.warrantyTerms }),
        ...(body.additionalInfo !== undefined && { additionalInfo: body.additionalInfo }),
        ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes }),
      };

      const updateResult = await ordersCollection.updateOne(
        {
          _id: orderObjectId,
          profileId,
        },
        {
          $set: setPayload,
        },
      );

      if (updateResult.matchedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      const updatedOrder = await ordersCollection.findOne({
        _id: orderObjectId,
        profileId,
      });

      if (!updatedOrder) {
        return reply.status(404).send(NotFoundPayload);
      }

      const clientNameMap = await buildClientNameMap(
        dependencies.clientsStore,
        profileId,
        updatedOrder.clientId ? [updatedOrder.clientId] : [],
      );

      return reply.status(200).send(serializeOrder(updatedOrder, clientNameMap));
    },
  );

  app.delete(
    '/api/orders/:orderId',
    {
      schema: {
        params: OrderParamsSchema,
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

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
      const params = request.params as OrderParams;
      const orderObjectId = new ObjectId(params.orderId);
      const profileId = profile._id.toHexString();

      const ordersCollection = dependencies.ordersStore.getCollection();
      const existingOrder = await ordersCollection.findOne({
        _id: orderObjectId,
        profileId,
      });

      if (!existingOrder) {
        return reply.status(404).send(NotFoundPayload);
      }

      const transactionsCollection = dependencies.transactionsStore.getCollection();
      const confirmedTransaction = await transactionsCollection.findOne({
        orderId: params.orderId,
        status: 'confirmed',
      });

      if (confirmedTransaction) {
        return reply.status(409).send(ConflictPayload);
      }

      await transactionsCollection.deleteMany({
        orderId: params.orderId,
      });

      const deleteResult = await ordersCollection.deleteOne({
        _id: orderObjectId,
        profileId,
      });

      if (deleteResult.deletedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(204).send();
    },
  );
};
