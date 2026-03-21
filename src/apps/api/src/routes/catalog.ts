import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

import type { AuthService } from '../lib/auth.js';
import type { CatalogStore, CatalogItem, CatalogUnitMeasure } from '../lib/catalog.js';
import type { ProfileStore } from '../lib/profile.js';

type CatalogRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  catalogStore: CatalogStore;
};

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
    type: Type.Union([Type.Literal('product'), Type.Literal('service')]),
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

const CatalogResponseSchema = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    type: Type.Union([Type.Literal('product'), Type.Literal('service')]),
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

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

type CatalogCreateBody = Static<typeof CatalogCreateSchema>;

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

      return reply.status(201).send({
        _id: createdItem._id.toHexString(),
        profileId: createdItem.profileId,
        type: createdItem.type,
        name: createdItem.name,
        description: createdItem.description,
        unitPrice: createdItem.unitPrice,
        unitMeasure: createdItem.unitMeasure,
        costPrice: createdItem.costPrice,
        createdAt: createdItem.createdAt.toISOString(),
        updatedAt: createdItem.updatedAt.toISOString(),
      });
    },
  );
};