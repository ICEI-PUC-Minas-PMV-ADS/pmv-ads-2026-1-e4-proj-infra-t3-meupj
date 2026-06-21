import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Filter, type WithId, type Document } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { Client, ClientStore, PersonType, ClientAddress } from '../lib/clients.js';
import {
  LIMIT_DEFAULT,
  MAX_LIMIT,
  MAX_PAGE,
  PAGE_DEFAULT,
  PositiveIntegerStringSchema,
  toBoundedPositiveInteger,
} from '../lib/pagination.js';
import type { ProfileStore } from '../lib/profile.js';

type ClientRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  clientsStore: ClientStore;
};

type ClientResponse = {
  _id: string;
  profileId: string;
  name: string;
  type: PersonType;
  document: string;
  email: string;
  phone: string;
  origin?: string;
  birthDate?: string;
  notes?: string;
  address: ClientAddress;
  createdAt: string;
  updatedAt: string;
};

type ClientListResponse = {
  data: ClientResponse[];
  total: number;
  page: number;
  limit: number;
};

type ClientUpdateSet = Partial<
  Pick<
    Client,
    'name' | 'type' | 'document' | 'email' | 'phone' | 'origin' | 'birthDate' | 'notes' | 'address'
  >
> & {
  updatedAt: Date;
};

const PersonTypeSchema = Type.Union([Type.Literal('individual'), Type.Literal('company')]);

const AddressSchema = Type.Object(
  {
    zipCode: Type.String(),
    street: Type.String(),
    number: Type.String(),
    complement: Type.Optional(Type.String()),
    district: Type.String(),
    city: Type.String(),
    state: Type.String({ maxLength: 2 }),
    country: Type.Optional(Type.String()),
  },
  {
    additionalProperties: false,
  },
);

const ClientCreateSchema = Type.Object(
  {
    name: Type.String(),
    type: PersonTypeSchema,
    document: Type.String(),
    email: Type.String({ format: 'email' }),
    phone: Type.String(),
    origin: Type.Optional(Type.String()),
    birthDate: Type.Optional(Type.String({ format: 'date' })),
    notes: Type.Optional(Type.String()),
    address: AddressSchema,
  },
  {
    additionalProperties: false,
  },
);

const ClientUpdateSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    type: Type.Optional(PersonTypeSchema),
    document: Type.Optional(Type.String()),
    email: Type.Optional(Type.String({ format: 'email' })),
    phone: Type.Optional(Type.String()),
    origin: Type.Optional(Type.String()),
    birthDate: Type.Optional(Type.String({ format: 'date' })),
    notes: Type.Optional(Type.String()),
    address: Type.Optional(AddressSchema),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

const ClientParamsSchema = Type.Object(
  {
    clientId: Type.String({ pattern: '^[a-fA-F0-9]{24}$' }),
  },
  {
    additionalProperties: false,
  },
);

const ClientSortBySchema = Type.Union([
  Type.Literal('name'),
  Type.Literal('email'),
  Type.Literal('createdAt'),
  Type.Literal('birthDate'),
]);

const ClientSortOrderSchema = Type.Union([Type.Literal('asc'), Type.Literal('desc')]);

const ClientListQuerySchema = Type.Object(
  {
    page: Type.Optional(
      Type.Union([Type.Integer({ minimum: 1, maximum: MAX_PAGE }), PositiveIntegerStringSchema]),
    ),
    limit: Type.Optional(
      Type.Union([Type.Integer({ minimum: 1, maximum: MAX_LIMIT }), PositiveIntegerStringSchema]),
    ),
    q: Type.Optional(Type.String()),
    type: Type.Optional(PersonTypeSchema),
    sortBy: Type.Optional(ClientSortBySchema),
    sortOrder: Type.Optional(ClientSortOrderSchema),
  },
  {
    additionalProperties: false,
  },
);

const ClientResponseSchema = Type.Object(
  {
    _id: Type.String(),
    profileId: Type.String(),
    name: Type.String(),
    type: PersonTypeSchema,
    document: Type.String(),
    email: Type.String({ format: 'email' }),
    phone: Type.String(),
    origin: Type.Optional(Type.String()),
    birthDate: Type.Optional(Type.String({ format: 'date' })),
    notes: Type.Optional(Type.String()),
    address: AddressSchema,
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  {
    additionalProperties: false,
  },
);

const ClientListResponseSchema = Type.Object(
  {
    data: Type.Array(ClientResponseSchema),
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
  message: Type.Literal('Client not found'),
  statusCode: Type.Literal(404),
});

const ConflictSchema = Type.Object({
  error: Type.Literal('Conflict'),
  message: Type.Literal('Client is linked to existing orders'),
  statusCode: Type.Literal(409),
});

const UnauthorizedPayload = Object.freeze({
  error: 'Unauthorized',
  message: 'Unauthorized',
  statusCode: 401,
});

const NotFoundPayload = Object.freeze({
  error: 'NotFound',
  message: 'Client not found',
  statusCode: 404,
});

const ConflictPayload = Object.freeze({
  error: 'Conflict',
  message: 'Client is linked to existing orders',
  statusCode: 409,
});

const BadRequestSchema = Type.Object({
  error: Type.Literal('BadRequest'),
  message: Type.String(),
  statusCode: Type.Literal(400),
});

type ClientCreateBody = Static<typeof ClientCreateSchema>;
type ClientUpdateBody = Static<typeof ClientUpdateSchema>;
type ClientParams = Static<typeof ClientParamsSchema>;
type ClientListQuery = Static<typeof ClientListQuerySchema>;

const toClientResponse = (item: WithId<Client>): ClientResponse => ({
  _id: item._id.toHexString(),
  profileId: item.profileId,
  name: item.name,
  type: item.type,
  document: item.document,
  email: item.email,
  phone: item.phone,
  address: item.address,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
  ...(item.origin !== undefined && { origin: item.origin }),
  ...(item.birthDate !== undefined && { birthDate: item.birthDate }),
  ...(item.notes !== undefined && { notes: item.notes }),
});

const validateDocumentByType = (documento: string, type: PersonType): boolean => {
  // Remove caracteres não numéricos
  const cleanDoc = documento.replace(/\D/g, '');

  if (type === 'individual') {
    // CPF: 11 dígitos
    if (cleanDoc.length !== 11) return false;

    // Validação básica de CPF (pode ser aprimorada)
    const cpf = cleanDoc.split('').map(Number);
    if (cpf.every((digit) => digit === cpf[0])) return false; // CPF com todos dígitos iguais

    return true;
  } else if (type === 'company') {
    // CNPJ: 14 dígitos
    if (cleanDoc.length !== 14) return false;

    // Validação básica de CNPJ (pode ser aprimorada)
    const cnpj = cleanDoc.split('').map(Number);
    if (cnpj.every((digit) => digit === cnpj[0])) return false; // CNPJ com todos dígitos iguais

    return true;
  }

  return false;
};

export const registerClientsRoutes = (
  app: FastifyInstance,
  dependencies: ClientRouteDependencies,
): void => {
  app.get(
    '/api/clients',
    {
      schema: {
        querystring: ClientListQuerySchema,
        response: {
          200: ClientListResponseSchema,
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
      const query = request.query as ClientListQuery;

      const page = toBoundedPositiveInteger(query.page, PAGE_DEFAULT, MAX_PAGE);
      const limit = toBoundedPositiveInteger(query.limit, LIMIT_DEFAULT, MAX_LIMIT);
      const sortBy = query.sortBy ?? 'createdAt';
      const sortOrder = query.sortOrder ?? 'desc';
      const skip = (page - 1) * limit;
      const profileId = profile._id.toHexString();

      const filter: Filter<Client> = {
        profileId,
      };

      if (query.type) {
        filter.type = query.type;
      }

      if (query.q && query.q.trim().length > 0) {
        const normalizedQuery = query.q.trim();
        filter.$or = [
          { name: { $regex: normalizedQuery, $options: 'i' } },
          { email: { $regex: normalizedQuery, $options: 'i' } },
          { document: { $regex: normalizedQuery, $options: 'i' } },
        ];
      }

      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortDirection } as Record<string, 1 | -1>;

      const collection = dependencies.clientsStore.getCollection();
      const [items, total] = await Promise.all([
        collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);

      const response: ClientListResponse = {
        data: items.map(toClientResponse),
        total,
        page,
        limit,
      };

      return reply.status(200).send(response);
    },
  );

  app.post(
    '/api/clients',
    {
      schema: {
        body: ClientCreateSchema,
        response: {
          201: ClientResponseSchema,
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

      const body = request.body as ClientCreateBody;

      // Validar documento conforme tipo
      if (!validateDocumentByType(body.document, body.type)) {
        return reply.status(400).send({
          error: 'BadRequest',
          message: `Documento inválido para tipo ${body.type}`,
          statusCode: 400,
        });
      }

      const now = new Date();
      const client: Omit<Client, '_id'> = {
        profileId: profile._id.toHexString(),
        name: body.name,
        type: body.type,
        document: body.document,
        email: body.email,
        phone: body.phone,
        address: body.address,
        createdAt: now,
        updatedAt: now,
        ...(body.origin !== undefined && { origin: body.origin }),
        ...(body.birthDate !== undefined && { birthDate: body.birthDate }),
        ...(body.notes !== undefined && { notes: body.notes }),
      };

      const collection = dependencies.clientsStore.getCollection();
      const result = await collection.insertOne(client);

      const createdClient = await collection.findOne({ _id: result.insertedId });

      if (!createdClient) {
        throw new Error('Failed to retrieve created client');
      }

      return reply.status(201).send(toClientResponse(createdClient));
    },
  );

  app.get(
    '/api/clients/:clientId',
    {
      schema: {
        params: ClientParamsSchema,
        response: {
          200: ClientResponseSchema,
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
      const params = request.params as ClientParams;
      const clientObjectId = new ObjectId(params.clientId);

      const collection = dependencies.clientsStore.getCollection();
      const client = await collection.findOne({
        _id: clientObjectId,
        profileId: profile._id.toHexString(),
      });

      if (!client) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(toClientResponse(client));
    },
  );

  app.put(
    '/api/clients/:clientId',
    {
      schema: {
        params: ClientParamsSchema,
        body: ClientUpdateSchema,
        response: {
          200: ClientResponseSchema,
          400: BadRequestSchema,
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

      const params = request.params as ClientParams;
      const body = request.body as ClientUpdateBody;

      const collection = dependencies.clientsStore.getCollection();

      // Se document ou type estão sendo atualizados, validar documento
      if (body.document !== undefined || body.type !== undefined) {
        // Buscar cliente atual para obter o type se não estiver sendo atualizado
        const currentClient = await collection.findOne({
          _id: new ObjectId(params.clientId),
          profileId: profile._id.toHexString(),
        });

        if (!currentClient) {
          return reply.status(404).send(NotFoundPayload);
        }

        const typeToValidate = body.type ?? currentClient.type;
        const documentToValidate = body.document ?? currentClient.document;

        if (!validateDocumentByType(documentToValidate, typeToValidate)) {
          return reply.status(400).send({
            error: 'BadRequest',
            message: `Documento inválido para tipo ${typeToValidate}`,
            statusCode: 400,
          });
        }
      }

      const now = new Date();

      const setPayload: ClientUpdateSet = {
        updatedAt: now,
        ...(body.name !== undefined && { name: body.name }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.document !== undefined && { document: body.document }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.origin !== undefined && { origin: body.origin }),
        ...(body.birthDate !== undefined && { birthDate: body.birthDate }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.address !== undefined && { address: body.address }),
      };

      const clientObjectId = new ObjectId(params.clientId);

      const updateResult = await collection.updateOne(
        {
          _id: clientObjectId,
          profileId: profile._id.toHexString(),
        },
        {
          $set: setPayload,
        },
      );

      if (updateResult.matchedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      const updatedClient = await collection.findOne({
        _id: clientObjectId,
        profileId: profile._id.toHexString(),
      });

      if (!updatedClient) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(200).send(toClientResponse(updatedClient));
    },
  );

  app.delete(
    '/api/clients/:clientId',
    {
      schema: {
        params: ClientParamsSchema,
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
      const params = request.params as ClientParams;
      const clientObjectId = new ObjectId(params.clientId);
      const profileId = profile._id.toHexString();

      const collection = dependencies.clientsStore.getCollection();
      const existingClient = await collection.findOne({
        _id: clientObjectId,
        profileId,
      });

      if (!existingClient) {
        return reply.status(404).send(NotFoundPayload);
      }

      // TODO: Validar integração quando a coleção 'orders' for implementada
      const ordersCollection = collection.db.collection<Document>('orders');
      const linkedOrder = await ordersCollection.findOne({
        clientId: params.clientId,
      });

      if (linkedOrder) {
        return reply.status(409).send(ConflictPayload);
      }

      const deleteResult = await collection.deleteOne({
        _id: clientObjectId,
        profileId,
      });

      if (deleteResult.deletedCount === 0) {
        return reply.status(404).send(NotFoundPayload);
      }

      return reply.status(204).send();
    },
  );
};
