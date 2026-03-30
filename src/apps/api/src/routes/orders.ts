import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { CatalogStore } from '../lib/catalog.js';
import type { CountersStore } from '../lib/counters.js';
import type { OrderStatus, OrdersStore, PaymentMethod } from '../lib/orders.js';
import type { ProfileStore } from '../lib/profile.js';
import type { TransactionsStore } from '../lib/transactions.js';

export type OrdersRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  catalogStore: CatalogStore;
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

const OrderResponseSchema = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    clientId: Type.Union([Type.String(), Type.Null()]),
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

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

type OrderCreateBody = Static<typeof OrderCreateSchema>;

export const registerOrdersRoutes = (
  app: FastifyInstance,
  dependencies: OrdersRouteDependencies,
): void => {
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
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
      const profileId = profile._id.toHexString();
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

        return {
          catalogItemId: payloadItem.catalogItemId,
          type: catalogData.type,
          name: catalogData.name,
          description: catalogData.description,
          unitPrice: catalogData.unitPrice,
          unitMeasure: catalogData.unitMeasure,
          quantity: payloadItem.quantity,
          subtotal,
          position: index,
        };
      });

      const startTotal = calculcatedItemsTotal;
      const discount = body.discount ?? 0;
      const fees = body.fees ?? 0;
      const finalTotal = startTotal - discount + fees;

      const orderSeq = await dependencies.countersStore.getNextSequence(`orders_${profileId}`);
      const orderNumberStr = String(orderSeq).padStart(4, '0');

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

      return reply.status(201).send({
        ...createdOrder,
        _id: createdOrder._id.toHexString(),
        createdAt: createdOrder.createdAt.toISOString(),
        updatedAt: createdOrder.updatedAt.toISOString(),
      });
    },
  );
};
