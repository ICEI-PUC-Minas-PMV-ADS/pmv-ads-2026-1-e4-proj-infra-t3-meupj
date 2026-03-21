import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type WithId } from 'mongodb';

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

type CatalogCreateBody = Static<typeof CatalogCreateSchema>;
type CatalogUpdateBody = Static<typeof CatalogUpdateSchema>;
type CatalogParams = Static<typeof CatalogParamsSchema>;

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
};