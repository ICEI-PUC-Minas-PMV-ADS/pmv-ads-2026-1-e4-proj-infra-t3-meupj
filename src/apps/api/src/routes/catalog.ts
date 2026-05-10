import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Document, type Filter, type WithId } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { CatalogStore, CatalogItem, CatalogUnitMeasure } from '../lib/catalog.js';
import type { ProfileStore } from '../lib/profile.js';

type CatalogRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  catalogStore: CatalogStore;
};

type CatalogResponse = {
  _id: string;
  profileId: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  unitPrice: number;
  unitMeasure: CatalogUnitMeasure;
  costPrice?: number;
  createdAt: string;
  updatedAt: string;
};

type CatalogListResponse = {
  data: CatalogResponse[];
  total: number;
  page: number;
  limit: number;
};

type CatalogUpdateSet = Partial<
  Pick<CatalogItem, 'type' | 'name' | 'description' | 'unitPrice' | 'unitMeasure' | 'costPrice'>
> & {
  updatedAt: Date;
};

const CatalogTypeSchema = Type.Union([Type.Literal('product'), Type.Literal('service')]);

const CatalogUnitMeasureSchema = Type.Union([
  Type.Literal('unit'),
  Type.Literal('dozen'),
  Type.Literal('hour'),
  Type.Literal('day'),
  Type.Literal('week'),
  Type.Literal('month'),
  Type.Literal('meter'),
  Type.Literal('squareMeter'),
  Type.Literal('kilogram'),
  Type.Literal('box'),
  Type.Literal('kit'),
  Type.Literal('piece'),
]);

const CatalogCreateSchema = Type.Object(
  {
    type: CatalogTypeSchema,
    name: Type.String(),
    unitPrice: Type.Number({ minimum: 0 }),
    unitMeasure: CatalogUnitMeasureSchema,
    description: Type.Optional(Type.String()),
    costPrice: Type.Optional(Type.Number({ minimum: 0 })),
  },
  {
    additionalProperties: false,
  },
);

const CatalogUpdateSchema = Type.Object(
  {
    type: Type.Optional(CatalogTypeSchema),
    name: Type.Optional(Type.String()),
    unitPrice: Type.Optional(Type.Number({ minimum: 0 })),
    unitMeasure: Type.Optional(CatalogUnitMeasureSchema),
    description: Type.Optional(Type.String()),
    costPrice: Type.Optional(Type.Number({ minimum: 0 })),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

const CatalogParamsSchema = Type.Object(
  {
    itemId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
  },
  {
    additionalProperties: false,
  },
);

const CatalogSortBySchema = Type.Union([
  Type.Literal('name'),
  Type.Literal('unitPrice'),
  Type.Literal('createdAt'),
]);

const CatalogSortOrderSchema = Type.Union([Type.Literal('asc'), Type.Literal('desc')]);

const PAGE_DEFAULT = 1;
const LIMIT_DEFAULT = 20;
const MAX_PAGE = 1000;
const MAX_LIMIT = 100;
const POSITIVE_INTEGER_PATTERN = '^[1-9][0-9]*$';
const POSITIVE_INTEGER_REGEX = new RegExp(POSITIVE_INTEGER_PATTERN);

const PositiveIntegerStringSchema = Type.String({ pattern: POSITIVE_INTEGER_PATTERN });

const CatalogListQuerySchema = Type.Object(
  {
    page: Type.Optional(Type.Union([Type.Integer({ minimum: 1, maximum: MAX_PAGE }), PositiveIntegerStringSchema])),
    limit: Type.Optional(
      Type.Union([Type.Integer({ minimum: 1, maximum: MAX_LIMIT }), PositiveIntegerStringSchema]),
    ),
    q: Type.Optional(Type.String()),
    type: Type.Optional(CatalogTypeSchema),
    sortBy: Type.Optional(CatalogSortBySchema),
    sortOrder: Type.Optional(CatalogSortOrderSchema),
  },
  {
    additionalProperties: false,
  },
);

const CatalogResponseSchema = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    type: CatalogTypeSchema,
    name: Type.String(),
    description: Type.Optional(Type.String()),
    unitPrice: Type.Number(),
    unitMeasure: CatalogUnitMeasureSchema,
    costPrice: Type.Optional(Type.Number()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  {
    additionalProperties: false,
  },
);

const CatalogListResponseSchema = Type.Object(
  {
    data: Type.Array(CatalogResponseSchema),
    total: Type.Integer({ minimum: 0 }),
    page: Type.Integer({ minimum: 1 }),
    limit: Type.Integer({ minimum: 1 }),
  },
  {
    additionalProperties: false,
  },
);

const UnauthorizedSchema = Type.Object({
  error: Type.Literal('Unauthorized'),
  message: Type.Literal('Unauthorized'),
  statusCode: Type.Literal(401),
});

const NotFoundSchema = Type.Object({
  error: Type.Literal('NotFound'),
  message: Type.Literal('Catalog item not found'),
  statusCode: Type.Literal(404),
});

const ConflictSchema = Type.Object({
  error: Type.Literal('Conflict'),
  message: Type.Literal('Catalog item is linked to existing orders'),
  statusCode: Type.Literal(409),
});

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

const NotFoundPayload = Object.freeze({
  error: 'NotFound',
  message: 'Catalog item not found',
  statusCode: 404,
});

const ConflictPayload = Object.freeze({
  error: 'Conflict',
  message: 'Catalog item is linked to existing orders',
  statusCode: 409,
});

type CatalogCreateBody = Static<typeof CatalogCreateSchema>;
type CatalogUpdateBody = Static<typeof CatalogUpdateSchema>;
type CatalogParams = Static<typeof CatalogParamsSchema>;
type CatalogListQuery = Static<typeof CatalogListQuerySchema>;

const toBoundedPositiveInteger = (
  value: number | string | undefined,
  fallback: number,
  maximum: number,
): number => {
  const safeFallback = Math.min(Math.max(fallback, 1), maximum);

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 1) {
      return safeFallback;
    }

    return Math.min(value, maximum);
  }

  if (typeof value === 'string') {
    if (!POSITIVE_INTEGER_REGEX.test(value)) {
      return safeFallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      return safeFallback;
    }

    return Math.min(parsed, maximum);
  }

  return safeFallback;
};

const toCatalogResponse = (item: WithId<CatalogItem>): CatalogResponse => ({
  _id: item._id.toHexString(),
  profileId: item.profileId,
  type: item.type,
  name: item.name,
  unitPrice: item.unitPrice,
  unitMeasure: item.unitMeasure,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
  ...(item.description !== undefined && { description: item.description }),
  ...(item.costPrice !== undefined && { costPrice: item.costPrice }),
});

export const registerCatalogRoutes = (
  app: FastifyInstance,
  dependencies: CatalogRouteDependencies,
): void => {
  app.get(
    '/api/catalog',
    {
      schema: {
        querystring: CatalogListQuerySchema,
        response: {
          200: CatalogListResponseSchema,
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
      const query = request.query as CatalogListQuery;

      const page = toBoundedPositiveInteger(query.page, PAGE_DEFAULT, MAX_PAGE);
      const limit = toBoundedPositiveInteger(query.limit, LIMIT_DEFAULT, MAX_LIMIT);
      const sortBy = query.sortBy ?? 'createdAt';
      const sortOrder = query.sortOrder ?? 'desc';
      const skip = (page - 1) * limit;
      const profileId = profile._id.toHexString();

      const filter: Filter<CatalogItem> = {
        profileId,
      };

      if (query.type) {
        filter.type = query.type;
      }

      if (query.q && query.q.trim().length > 0) {
        const normalizedQuery = query.q.trim();
        filter.$or = [
          { name: { $regex: normalizedQuery, $options: 'i' } },
          { description: { $regex: normalizedQuery, $options: 'i' } },
        ];
      }

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortDirection } as Record<string, 1 | -1>;

      const collection = dependencies.catalogStore.getCollection();
      const [items, total] = await Promise.all([
        collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);

      const response: CatalogListResponse = {
        data: items.map(toCatalogResponse),
        total,
        page,
        limit,
      };

      return reply.status(200).send(response);
    },
  );

  
  app.get(
    '/api/catalog/:itemId',
    {
      schema: {
        params: CatalogParamsSchema,
        response: {
          200: CatalogResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);
      const params = request.params as CatalogParams;
      const collection = dependencies.catalogStore.getCollection();

      const item = await collection.findOne({
        _id: new ObjectId(params.itemId),
        profileId: profile._id.toHexString(),
      });

      if (!item) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(toCatalogResponse(item));
    },
  );

  app.post(
    '/api/catalog',
    {
      schema: {
        body: CatalogCreateSchema,
        response: {
          201: CatalogResponseSchema,
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

      const body = request.body as CatalogCreateBody;
      const now = new Date();
      const catalogItem: Omit<CatalogItem, '_id'> = {
        profileId: profile._id.toHexString(),
        type: body.type,
        name: body.name,
        unitPrice: body.unitPrice,
        unitMeasure: body.unitMeasure,
        createdAt: now,
        updatedAt: now,
        ...(body.description !== undefined && { description: body.description }),
        ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
      };

      const collection = dependencies.catalogStore.getCollection();
      const result = await collection.insertOne(catalogItem);

      const createdItem = await collection.findOne({ _id: result.insertedId });

      if (!createdItem) {
        throw new Error('Failed to retrieve created catalog item');
      }

      return reply.status(201).send(toCatalogResponse(createdItem));
    },
  );

  app.put(
    '/api/catalog/:itemId',
    {
      schema: {
        params: CatalogParamsSchema,
        body: CatalogUpdateSchema,
        response: {
          200: CatalogResponseSchema,
          401: UnauthorizedSchema,
          404: NotFoundSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await dependencies.authService.getSessionFromHeaders(request.headers);

      if (!session) {
        return reply.status(401).send(UnauthorizedPayload);
      }

      const profile = await dependencies.profileStore.ensureByAuthUserId(session.user.id);

      const params = request.params as CatalogParams;
      const body = request.body as CatalogUpdateBody;
      const now = new Date();

      const setPayload: CatalogUpdateSet = {
        updatedAt: now,
        ...(body.type !== undefined && { type: body.type }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.unitPrice !== undefined && { unitPrice: body.unitPrice }),
        ...(body.unitMeasure !== undefined && { unitMeasure: body.unitMeasure }),
        ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
      };

      const collection = dependencies.catalogStore.getCollection();
      const itemObjectId = new ObjectId(params.itemId);

      const updateResult = await collection.updateOne(
        {
          _id: itemObjectId,
          profileId: profile._id.toHexString(),
        },
        {
          $set: setPayload,
        },
      );

      if (updateResult.matchedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      const updatedItem = await collection.findOne({
        _id: itemObjectId,
        profileId: profile._id.toHexString(),
      });

      if (!updatedItem) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(toCatalogResponse(updatedItem));
    },
  );

  app.delete(
    '/api/catalog/:itemId',
    {
      schema: {
        params: CatalogParamsSchema,
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
      const params = request.params as CatalogParams;
      const itemObjectId = new ObjectId(params.itemId);
      const profileId = profile._id.toHexString();

      const collection = dependencies.catalogStore.getCollection();
      const existingItem = await collection.findOne({
        _id: itemObjectId,
        profileId,
      });

      if (!existingItem) {
        return reply.status(404).send(NotFoundPayload);
      }
      // TODO: Validar integração quando a coleção 'orders' for implementada
      const ordersCollection = collection.db.collection<Document>('orders');
      const linkedOrder = await ordersCollection.findOne({
        'items.catalogItemId': params.itemId,
      });

      if (linkedOrder) {
        return reply.status(409).send(ConflictPayload);
      }

      const deleteResult = await collection.deleteOne({
        _id: itemObjectId,
        profileId,
      });

      if (deleteResult.deletedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(204).send();
    },
  );
};
