import type { FastifyInstance } from 'fastify';
import { ObjectId, type Collection } from 'mongodb';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../app.js';
import type { AuthService } from '../lib/auth.js';
import type { CatalogStore } from '../lib/catalog.js';
import type { Client, ClientStore } from '../lib/clients.js';
import type { CountersStore } from '../lib/counters.js';
import type { MongoService } from '../lib/mongo.js';
import type { Order, OrdersStore } from '../lib/orders.js';
import type { ProfileStore } from '../lib/profile.js';
import type { Transaction, TransactionsStore } from '../lib/transactions.js';

const DEFAULT_ENV = {
  BETTER_AUTH_SECRET: '01234567890123456789012345678901',
  BETTER_AUTH_URL: 'http://localhost:3000',
  MONGODB_URI: 'mongodb://localhost:27017/meupj',
};

const createAuthServiceMock = (session: unknown): AuthService => ({
  handleRequest: () =>
    Promise.resolve(
      new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    ),
  getSessionFromHeaders: vi.fn().mockResolvedValue(session),
});

const createMongoMock = (healthy: boolean): MongoService => ({
  close: vi.fn().mockResolvedValue(undefined),
  getClient: vi.fn(() => {
    throw new Error('not implemented in tests');
  }),
  getDb: vi.fn(() => {
    throw new Error('not implemented in tests');
  }),
  getStatus: vi.fn(() => ({
    lastError: healthy ? null : 'connection refused',
    state: healthy ? ('connected' as const) : ('degraded' as const),
  })),
  initialize: vi.fn().mockResolvedValue(undefined),
  isHealthy: vi.fn(() => healthy),
});

const createProfileStoreMock = (
  profileId = new ObjectId(),
  authUserId = 'auth-user-1',
): ProfileStore => ({
  ensureByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: {
      address: {
        city: 'Belo Horizonte',
        complement: null,
        country: 'Brasil',
        district: 'Centro',
        number: '100',
        state: 'MG',
        street: 'Rua A',
        zipCode: '30110000',
      },
      color: null,
      document: '12345678000199',
      email: 'contato@meupj.com',
      footer: 'Obrigado pela preferencia.',
      logo: null,
      name: 'Meu PJ',
      phone: '31999999999',
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
  ensureIndexes: vi.fn().mockResolvedValue(undefined),
  getByAuthUserId: vi.fn().mockResolvedValue(null),
  updateBusinessByAuthUserId: vi.fn(async (resolvedAuthUserId, business) => ({
    _id: profileId,
    authUserId: resolvedAuthUserId,
    business: {
      ...business,
      address: { ...business.address },
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  })),
});

type OrderQuery = {
  _id: { toHexString: () => string };
  profileId: string;
};

const createOrdersStoreMock = (order: (Order & { _id: ObjectId }) | null): OrdersStore => {
  const collection = {
    findOne: vi.fn((query: OrderQuery) => {
      if (!order) return Promise.resolve(null);
      if (order._id.toHexString() !== query._id.toHexString()) return Promise.resolve(null);
      if (order.profileId !== query.profileId) return Promise.resolve(null);
      return Promise.resolve(order);
    }),
  } as unknown as Collection<Order>;

  return {
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => collection),
  };
};

type ClientQuery = {
  _id: { toHexString: () => string };
  profileId: string;
};

const createClientsStoreMock = (client: (Client & { _id: ObjectId }) | null): ClientStore => {
  const collection = {
    findOne: vi.fn((query: ClientQuery) => {
      if (!client) return Promise.resolve(null);
      if (client._id.toHexString() !== query._id.toHexString()) return Promise.resolve(null);
      if (client.profileId !== query.profileId) return Promise.resolve(null);
      return Promise.resolve(client);
    }),
  } as unknown as Collection<Client>;

  return {
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => collection),
  };
};

const createNoOpCollection = () => ({
  createIndex: vi.fn().mockResolvedValue('ok'),
});

const createCatalogStoreStub = () =>
  ({
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => createNoOpCollection()),
  }) as unknown as CatalogStore;

type TransactionQuery = {
  _id: { toHexString: () => string };
  profileId: string;
  status?: string;
};

const createTransactionsStoreMock = (
  transaction: (Transaction & { _id: ObjectId }) | null,
): TransactionsStore => {
  const collection = {
    findOne: vi.fn((query: TransactionQuery) => {
      if (!transaction) return Promise.resolve(null);
      if (transaction._id.toHexString() !== query._id.toHexString()) return Promise.resolve(null);
      if (transaction.profileId !== query.profileId) return Promise.resolve(null);
      if (query.status && transaction.status !== query.status) return Promise.resolve(null);
      return Promise.resolve(transaction);
    }),
  } as unknown as Collection<Transaction>;

  return {
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => collection),
  };
};

const createCountersStoreStub = () =>
  ({
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    generateOrderNumber: vi.fn(() => Promise.resolve('ORD2601001')),
    getCollection: vi.fn(() => createNoOpCollection()),
    getNextSequence: vi.fn(() => Promise.resolve(1)),
  }) as unknown as CountersStore;

const createBaseApp = async ({
  authSession = { user: { id: 'auth-user-1' } },
  client = null,
  order = null,
  profileId = new ObjectId(),
  transaction = null,
}: {
  authSession?: unknown;
  client?: (Client & { _id: ObjectId }) | null;
  order?: (Order & { _id: ObjectId }) | null;
  profileId?: ObjectId;
  transaction?: (Transaction & { _id: ObjectId }) | null;
}): Promise<FastifyInstance> => {
  return buildApp({
    auth: createAuthServiceMock(authSession),
    catalogStore: createCatalogStoreStub(),
    clientsStore: createClientsStoreMock(client),
    countersStore: createCountersStoreStub(),
    envData: DEFAULT_ENV,
    mongo: createMongoMock(true),
    ordersStore: createOrdersStoreMock(order),
    profileStore: createProfileStoreMock(profileId, 'auth-user-1'),
    transactionsStore: createTransactionsStoreMock(transaction),
  });
};

const expectPdfResponse = (response: { body: string; headers: Record<string, string> }) => {
  expect(response.headers['content-type']).toContain('application/pdf');
  expect(Buffer.byteLength(response.body)).toBeGreaterThan(0);
};

let app: FastifyInstance | undefined;

afterEach(async () => {
  if (app) {
    await app.close();
    app = undefined;
  }
});

describe('documents routes', () => {
  it('returns 401 when unauthenticated', async () => {
    app = await createBaseApp({ authSession: null });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/budget/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('returns 404 when order does not exist in profile scope', async () => {
    app = await createBaseApp({});

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/budget/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'Not Found',
      message: 'Order not found',
      statusCode: 404,
    });
  });

  it('returns assembled budget document for existing order', async () => {
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const orderId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: clientId.toHexString(),
      createdAt: new Date('2026-04-10T10:00:00.000Z'),
      discount: 10,
      fees: 20,
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          name: 'Instalacao',
          position: 0,
          quantity: 2,
          subtotal: 240,
          type: 'service' as const,
          unitMeasure: 'hora',
          unitPrice: 120,
        },
      ],
      orderNumber: 'ORD2601009',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      reference: 'REF-10',
      status: 'draft' as const,
      total: 250,
      updatedAt: new Date('2026-04-10T10:30:00.000Z'),
    };

    const client = {
      _id: clientId,
      address: {
        city: 'BH',
        country: 'Brasil',
        district: 'Centro',
        number: '20',
        state: 'MG',
        street: 'Rua B',
        zipCode: '30110000',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      document: '12345678900',
      email: 'cliente1@email.com',
      name: 'Cliente 1',
      phone: '31999999999',
      profileId: profileId.toHexString(),
      type: 'individual' as const,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    app = await createBaseApp({ client, order, profileId });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/budget/${orderId.toHexString()}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      client: { name: string } | null;
      documentType: string;
      order: { orderNumber: string };
      summary: { discount: number; fees: number; itemsSubtotal: number; total: number };
    }>();

    expect(body.documentType).toBe('budget');
    expect(body.order.orderNumber).toBe('ORD2601009');
    expect(body.client?.name).toBe('Cliente 1');
    expect(body.summary).toMatchObject({
      discount: 10,
      fees: 20,
      itemsSubtotal: 240,
      total: 250,
    });
  });

  it('returns 409 for budget when order is cancelled', async () => {
    const profileId = new ObjectId();
    const orderId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: null,
      createdAt: new Date('2026-04-10T10:00:00.000Z'),
      items: [],
      orderNumber: 'ORD2601011',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      status: 'cancelled' as const,
      total: 0,
      updatedAt: new Date('2026-04-10T10:30:00.000Z'),
    };

    app = await createBaseApp({ order, profileId });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/budget/${orderId.toHexString()}`,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: 'Conflict',
      message: 'Pedidos cancelados nao podem gerar orcamento.',
      statusCode: 409,
    });
  });

  it('returns pdf buffer for budget document', async () => {
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const orderId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: clientId.toHexString(),
      createdAt: new Date('2026-04-10T10:00:00.000Z'),
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          name: 'Instalacao',
          position: 0,
          quantity: 1,
          subtotal: 150,
          type: 'service' as const,
          unitMeasure: 'hora',
          unitPrice: 150,
        },
      ],
      orderNumber: 'ORD2601012',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      status: 'draft' as const,
      total: 150,
      updatedAt: new Date('2026-04-10T10:30:00.000Z'),
    };

    const client = {
      _id: clientId,
      address: {
        city: 'BH',
        country: 'Brasil',
        district: 'Centro',
        number: '20',
        state: 'MG',
        street: 'Rua B',
        zipCode: '30110000',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      document: '12345678900',
      email: 'cliente.pdf@email.com',
      name: 'Cliente PDF',
      phone: '31999999999',
      profileId: profileId.toHexString(),
      type: 'individual' as const,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    app = await createBaseApp({ client, order, profileId });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/budget/${orderId.toHexString()}/pdf`,
    });

    expect(response.statusCode).toBe(200);
    expectPdfResponse(response);
  });

  it('returns 401 for service-order endpoint when unauthenticated', async () => {
    app = await createBaseApp({ authSession: null });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/service-order/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('returns 404 for service-order endpoint when order does not exist in profile scope', async () => {
    app = await createBaseApp({});

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/service-order/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'Not Found',
      message: 'Order not found',
      statusCode: 404,
    });
  });

  it('returns assembled service-order document for existing order', async () => {
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const orderId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: clientId.toHexString(),
      createdAt: new Date('2026-04-10T11:00:00.000Z'),
      discount: 0,
      fees: 15,
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          name: 'Manutencao preventiva',
          position: 0,
          quantity: 1,
          subtotal: 200,
          type: 'service' as const,
          unitMeasure: 'hora',
          unitPrice: 200,
        },
      ],
      orderNumber: 'ORD2601010',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      status: 'inProgress' as const,
      total: 215,
      updatedAt: new Date('2026-04-10T11:30:00.000Z'),
      warrantyTerms: '30 dias',
    };

    const client = {
      _id: clientId,
      address: {
        city: 'Belo Horizonte',
        country: 'Brasil',
        district: 'Funcionarios',
        number: '45',
        state: 'MG',
        street: 'Rua C',
        zipCode: '30120000',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      document: '12345678000111',
      email: 'contato@cliente2.com',
      name: 'Cliente 2',
      phone: '3133334444',
      profileId: profileId.toHexString(),
      type: 'company' as const,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    app = await createBaseApp({ client, order, profileId });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/service-order/${orderId.toHexString()}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      client: { name: string } | null;
      documentType: string;
      order: { orderNumber: string; status: string };
      summary: { discount: number; fees: number; itemsSubtotal: number; total: number };
    }>();

    expect(body.documentType).toBe('serviceOrder');
    expect(body.order.orderNumber).toBe('ORD2601010');
    expect(body.order.status).toBe('inProgress');
    expect(body.client?.name).toBe('Cliente 2');
    expect(body.summary).toMatchObject({
      discount: 0,
      fees: 15,
      itemsSubtotal: 200,
      total: 215,
    });
  });

  it('returns 409 for service-order when order status is invalid', async () => {
    const profileId = new ObjectId();
    const orderId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: null,
      createdAt: new Date('2026-04-10T11:00:00.000Z'),
      items: [],
      orderNumber: 'ORD2601013',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      status: 'draft' as const,
      total: 0,
      updatedAt: new Date('2026-04-10T11:30:00.000Z'),
    };

    app = await createBaseApp({ order, profileId });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/service-order/${orderId.toHexString()}`,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: 'Conflict',
      message:
        'A ordem de servico so esta disponivel para pedidos em andamento, concluidos ou em garantia.',
      statusCode: 409,
    });
  });

  it('returns pdf buffer for service-order document', async () => {
    const profileId = new ObjectId();
    const orderId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: null,
      createdAt: new Date('2026-04-10T11:00:00.000Z'),
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          name: 'Reparo',
          position: 0,
          quantity: 1,
          subtotal: 320,
          type: 'service' as const,
          unitMeasure: 'servico',
          unitPrice: 320,
        },
      ],
      orderNumber: 'ORD2601014',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      status: 'completed' as const,
      total: 320,
      updatedAt: new Date('2026-04-10T11:30:00.000Z'),
    };

    app = await createBaseApp({ order, profileId });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/service-order/${orderId.toHexString()}/pdf`,
    });

    expect(response.statusCode).toBe(200);
    expectPdfResponse(response);
  });

  it('returns 401 for receipt endpoint when unauthenticated', async () => {
    app = await createBaseApp({ authSession: null });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/receipt/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('returns 404 for receipt endpoint when transaction does not exist', async () => {
    app = await createBaseApp({});

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/receipt/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'Not Found',
      message: 'Transaction not found',
      statusCode: 404,
    });
  });

  it('returns assembled receipt document for confirmed transaction', async () => {
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const orderId = new ObjectId();
    const transactionId = new ObjectId();

    const order = {
      _id: orderId,
      clientId: clientId.toHexString(),
      createdAt: new Date('2026-04-10T12:00:00.000Z'),
      discount: 0,
      fees: 0,
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          name: 'Servico finalizado',
          position: 0,
          quantity: 1,
          subtotal: 300,
          type: 'service' as const,
          unitMeasure: 'un',
          unitPrice: 300,
        },
      ],
      orderNumber: 'ORD2601015',
      paymentMethods: ['pix' as const],
      profileId: profileId.toHexString(),
      reference: 'REF-REC-01',
      status: 'completed' as const,
      total: 300,
      updatedAt: new Date('2026-04-10T12:30:00.000Z'),
    };

    const client = {
      _id: clientId,
      address: {
        city: 'Belo Horizonte',
        country: 'Brasil',
        district: 'Savassi',
        number: '200',
        state: 'MG',
        street: 'Rua D',
        zipCode: '30130000',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      document: '12345678900',
      email: 'recibo@cliente.com',
      name: 'Cliente Recibo',
      phone: '31999888777',
      profileId: profileId.toHexString(),
      type: 'individual' as const,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const transaction = {
      _id: transactionId,
      amount: 300,
      category: 'Servico',
      clientId: clientId.toHexString(),
      createdAt: new Date('2026-04-10T13:05:00.000Z'),
      dueDate: new Date('2026-04-10T13:00:00.000Z'),
      notes: 'Pagamento integral',
      orderId: orderId.toHexString(),
      paymentMethod: 'pix' as const,
      profileId: profileId.toHexString(),
      reference: 'TX-REC-01',
      status: 'confirmed' as const,
      transactionDate: new Date('2026-04-10T13:00:00.000Z'),
      type: 'income' as const,
      updatedAt: new Date('2026-04-10T13:05:00.000Z'),
    };

    app = await createBaseApp({ client, order, profileId, transaction });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/receipt/${transactionId.toHexString()}`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      client: { name: string } | null;
      documentType: string;
      order: { orderNumber: string } | null;
      summary: { totalReceived: number };
      transaction: { amount: number; status: string; type: string };
    }>();

    expect(body.documentType).toBe('receipt');
    expect(body.client?.name).toBe('Cliente Recibo');
    expect(body.order?.orderNumber).toBe('ORD2601015');
    expect(body.transaction.status).toBe('confirmed');
    expect(body.transaction.type).toBe('income');
    expect(body.transaction.amount).toBe(300);
    expect(body.summary.totalReceived).toBe(300);
  });

  it('returns 409 for receipt when transaction is not confirmed', async () => {
    const profileId = new ObjectId();
    const transactionId = new ObjectId();

    const transaction = {
      _id: transactionId,
      amount: 180,
      createdAt: new Date('2026-05-01T09:00:00.000Z'),
      paymentMethod: 'pix' as const,
      profileId: profileId.toHexString(),
      status: 'pending' as const,
      transactionDate: new Date('2026-05-01T10:00:00.000Z'),
      type: 'income' as const,
      updatedAt: new Date('2026-05-01T09:30:00.000Z'),
    };

    app = await createBaseApp({ profileId, transaction });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/receipt/${transactionId.toHexString()}`,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: 'Conflict',
      message: 'O recibo so esta disponivel para lancamentos confirmados.',
      statusCode: 409,
    });
  });

  it('returns pdf buffer for receipt document', async () => {
    const profileId = new ObjectId();
    const transactionId = new ObjectId();

    const transaction = {
      _id: transactionId,
      amount: 480,
      createdAt: new Date('2026-05-01T09:00:00.000Z'),
      paymentMethod: 'pix' as const,
      profileId: profileId.toHexString(),
      status: 'confirmed' as const,
      transactionDate: new Date('2026-05-01T10:00:00.000Z'),
      type: 'income' as const,
      updatedAt: new Date('2026-05-01T09:30:00.000Z'),
    };

    app = await createBaseApp({ profileId, transaction });

    const response = await app.inject({
      headers: { authorization: 'Bearer fake-token' },
      method: 'GET',
      url: `/api/documents/receipt/${transactionId.toHexString()}/pdf`,
    });

    expect(response.statusCode).toBe(200);
    expectPdfResponse(response);
  });
});
