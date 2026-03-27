import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Filter, type WithId, type Document } from 'mongodb';

import type { AuthService } from '../lib/auth.js';
import type { Client, ClientStore, PersonType, ClientAddress } from '../lib/clients.js';
import type { ProfileStore } from '../lib/profile.js';

type ClientRouteDependencies = {
  authService: AuthService;
  profileStore: ProfileStore;
  clientsStore: ClientStore;
};

type ClientResponse = {
  _id: string;
  profileId: string;
  nome: string;
  tipoPessoa: PersonType;
  documento: string;
  email: string;
  telefone: string;
  origem?: string;
  aniversario?: string;
  anotacoes?: string;
  endereco: ClientAddress;
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
    | 'nome'
    | 'tipoPessoa'
    | 'documento'
    | 'email'
    | 'telefone'
    | 'origem'
    | 'aniversario'
    | 'anotacoes'
    | 'endereco'
  >
> & {
  updatedAt: Date;
};

const PersonTypeSchema = Type.Union([Type.Literal('fisica'), Type.Literal('juridica')]);

const AddressSchema = Type.Object(
  {
    cep: Type.String(),
    logradouro: Type.String(),
    numero: Type.String(),
    complemento: Type.Optional(Type.String()),
    bairro: Type.String(),
    cidade: Type.String(),
    estado: Type.String({ maxLength: 2 }),
    pais: Type.Optional(Type.String()),
  },
  {
    additionalProperties: false,
  },
);

const ClientCreateSchema = Type.Object(
  {
    nome: Type.String(),
    tipoPessoa: PersonTypeSchema,
    documento: Type.String(),
    email: Type.String({ format: 'email' }),
    telefone: Type.String(),
    origem: Type.Optional(Type.String()),
    aniversario: Type.Optional(Type.String({ format: 'date' })),
    anotacoes: Type.Optional(Type.String()),
    endereco: AddressSchema,
  },
  {
    additionalProperties: false,
  },
);

const ClientUpdateSchema = Type.Object(
  {
    nome: Type.Optional(Type.String()),
    tipoPessoa: Type.Optional(PersonTypeSchema),
    documento: Type.Optional(Type.String()),
    email: Type.Optional(Type.String({ format: 'email' })),
    telefone: Type.Optional(Type.String()),
    origem: Type.Optional(Type.String()),
    aniversario: Type.Optional(Type.String({ format: 'date' })),
    anotacoes: Type.Optional(Type.String()),
    endereco: Type.Optional(AddressSchema),
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
  Type.Literal('nome'),
  Type.Literal('email'),
  Type.Literal('createdAt'),
  Type.Literal('aniversario'),
]);

const ClientSortOrderSchema = Type.Union([Type.Literal('asc'), Type.Literal('desc')]);

const ClientListQuerySchema = Type.Object(
  {
    page: Type.Optional(Type.Integer({ minimum: 1 })),
    limit: Type.Optional(Type.Integer({ minimum: 1 })),
    q: Type.Optional(Type.String()),
    tipoPessoa: Type.Optional(PersonTypeSchema),
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
    nome: Type.String(),
    tipoPessoa: PersonTypeSchema,
    documento: Type.String(),
    email: Type.String({ format: 'email' }),
    telefone: Type.String(),
    origem: Type.Optional(Type.String()),
    aniversario: Type.Optional(Type.String({ format: 'date' })),
    anotacoes: Type.Optional(Type.String()),
    endereco: AddressSchema,
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

const BadRequestPayload = Object.freeze({
  error: 'BadRequest',
  message: 'Bad request',
  statusCode: 400,
});

type ClientCreateBody = Static<typeof ClientCreateSchema>;
type ClientUpdateBody = Static<typeof ClientUpdateSchema>;
type ClientParams = Static<typeof ClientParamsSchema>;
type ClientListQuery = Static<typeof ClientListQuerySchema>;

const toClientResponse = (item: WithId<Client>): ClientResponse => ({
  _id: item._id.toHexString(),
  profileId: item.profileId,
  nome: item.nome,
  tipoPessoa: item.tipoPessoa,
  documento: item.documento,
  email: item.email,
  telefone: item.telefone,
  endereco: item.endereco,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
  ...(item.origem !== undefined && { origem: item.origem }),
  ...(item.aniversario !== undefined && { aniversario: item.aniversario }),
  ...(item.anotacoes !== undefined && { anotacoes: item.anotacoes }),
});

const validateDocumentByType = (documento: string, tipoPessoa: PersonType): boolean => {
  // Remove caracteres não numéricos
  const cleanDoc = documento.replace(/\D/g, '');

  if (tipoPessoa === 'fisica') {
    // CPF: 11 dígitos
    if (cleanDoc.length !== 11) return false;

    // Validação básica de CPF (pode ser aprimorada)
    const cpf = cleanDoc.split('').map(Number);
    if (cpf.every(digit => digit === cpf[0])) return false; // CPF com todos dígitos iguais

    return true;
  } else if (tipoPessoa === 'juridica') {
    // CNPJ: 14 dígitos
    if (cleanDoc.length !== 14) return false;

    // Validação básica de CNPJ (pode ser aprimorada)
    const cnpj = cleanDoc.split('').map(Number);
    if (cnpj.every(digit => digit === cnpj[0])) return false; // CNPJ com todos dígitos iguais

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

      const page = query.page ?? 1;
      const limit = query.limit ?? 20;
      const sortBy = query.sortBy ?? 'createdAt';
      const sortOrder = query.sortOrder ?? 'desc';
      const skip = (page - 1) * limit;
      const profileId = profile._id.toHexString();

      const filter: Filter<Client> = {
        profileId,
      };

      if (query.tipoPessoa) {
        filter.tipoPessoa = query.tipoPessoa;
      }

      if (query.q && query.q.trim().length > 0) {
        const normalizedQuery = query.q.trim();
        filter.$or = [
          { nome: { $regex: normalizedQuery, $options: 'i' } },
          { email: { $regex: normalizedQuery, $options: 'i' } },
          { documento: { $regex: normalizedQuery, $options: 'i' } },
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
      if (!validateDocumentByType(body.documento, body.tipoPessoa)) {
        return reply.status(400).send({
          error: 'BadRequest',
          message: `Documento inválido para tipo ${body.tipoPessoa}`,
          statusCode: 400,
        });
      }

      const now = new Date();
      const client: Omit<Client, '_id'> = {
        profileId: profile._id.toHexString(),
        nome: body.nome,
        tipoPessoa: body.tipoPessoa,
        documento: body.documento,
        email: body.email,
        telefone: body.telefone,
        endereco: body.endereco,
        createdAt: now,
        updatedAt: now,
        ...(body.origem !== undefined && { origem: body.origem }),
        ...(body.aniversario !== undefined && { aniversario: body.aniversario }),
        ...(body.anotacoes !== undefined && { anotacoes: body.anotacoes }),
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

      // Se documento ou tipoPessoa estão sendo atualizados, validar documento
      if (body.documento !== undefined || body.tipoPessoa !== undefined) {
        // Buscar cliente atual para obter o tipoPessoa se não estiver sendo atualizado
        const currentClient = await collection.findOne({
          _id: new ObjectId(params.clientId),
          profileId: profile._id.toHexString(),
        });

        if (!currentClient) {
          return reply.status(404).send(NotFoundPayload);
        }

        const tipoPessoaToValidate = body.tipoPessoa ?? currentClient.tipoPessoa;
        const documentoToValidate = body.documento ?? currentClient.documento;

        if (!validateDocumentByType(documentoToValidate, tipoPessoaToValidate)) {
          return reply.status(400).send({
            error: 'BadRequest',
            message: `Documento inválido para tipo ${tipoPessoaToValidate}`,
            statusCode: 400,
          });
        }
      }

      const now = new Date();

      const setPayload: ClientUpdateSet = {
        updatedAt: now,
        ...(body.nome !== undefined && { nome: body.nome }),
        ...(body.tipoPessoa !== undefined && { tipoPessoa: body.tipoPessoa }),
        ...(body.documento !== undefined && { documento: body.documento }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.telefone !== undefined && { telefone: body.telefone }),
        ...(body.origem !== undefined && { origem: body.origem }),
        ...(body.aniversario !== undefined && { aniversario: body.aniversario }),
        ...(body.anotacoes !== undefined && { anotacoes: body.anotacoes }),
        ...(body.endereco !== undefined && { endereco: body.endereco }),
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
