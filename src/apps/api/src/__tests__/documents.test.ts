import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Collection } from 'mongodb';

import { buildApp } from '../app.js';
import type { AuthService } from '../lib/auth.js';
import type { CatalogStore } from '../lib/catalog.js';
import type { Client, ClientStore } from '../lib/clients.js';
import type { CountersStore } from '../lib/counters.js';
import type { MongoService } from '../lib/mongo.js';
import type { Order, OrdersStore } from '../lib/orders.js';
import type { ProfileStore } from '../lib/profile.js';
import type { TransactionsStore } from '../lib/transactions.js';

const DEFAULT_ENV = {
  BETTER_AUTH_SECRET: '01234567890123456789012345678901',
  BETTER_AUTH_URL: 'http://localhost:3000',
  MONGODB_URI: 'mongodb://localhost:27017/meupj',
};

const createAuthServiceMock = (session: unknown): AuthService => ({
  handleRequest: () =>
    Promise.resolve(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ),
  getSessionFromHeaders: vi.fn().mockResolvedValue(session),
});

const createMongoMock = (healthy: boolean): MongoService => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  isHealthy: vi.fn(() => healthy),
  getStatus: vi.fn(() => ({
    state: healthy ? ('connected' as const) : ('degraded' as const),
    lastError: healthy ? null : 'connection refused',
  })),
  getClient: vi.fn(() => {
    throw new Error('not implemented in tests');
  }),
  getDb: vi.fn(() => {
    throw new Error('not implemented in tests');
  }),
  close: vi.fn().mockResolvedValue(undefined),
});

const createProfileStoreMock = (profileId = new ObjectId(), authUserId = 'auth-user-1'): ProfileStore => ({
  ensureIndexes: vi.fn().mockResolvedValue(undefined),
  getByAuthUserId: vi.fn().mockResolvedValue(null),
  ensureByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: {
      name: 'Meu PJ',
      document: '12345678000199',
      phone: '31999999999',
      email: 'contato@meupj.com',
      logo: null,
      color: null,
      footer: 'Obrigado pela preferencia.',
      address: {
        zipCode: '30110000',
        street: 'Rua A',
        number: '100',
        complement: null,
        district: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG',
        country: 'Brasil',
      },
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
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

const createTransactionsStoreStub = () =>
  ({
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => createNoOpCollection()),
  }) as unknown as TransactionsStore;

const createCountersStoreStub = () =>
  ({
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => createNoOpCollection()),
    getNextSequence: vi.fn(() => Promise.resolve(1)),
    generateOrderNumber: vi.fn(() => Promise.resolve('ORD2601001')),
  }) as unknown as CountersStore;

let app: FastifyInstance | undefined;

afterEach(async () => {
  if (app) {
    await app.close();
    app = undefined;
  }
});

describe('documents routes', () => {
  it('returns 401 when unauthenticated', async () => {
    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: createAuthServiceMock(null),
      profileStore: createProfileStoreMock(),
      ordersStore: createOrdersStoreMock(null),
      clientsStore: createClientsStoreMock(null),
      catalogStore: createCatalogStoreStub(),
      transactionsStore: createTransactionsStoreStub(),
      countersStore: createCountersStoreStub(),
    });

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
    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: createAuthServiceMock({ user: { id: 'auth-user-1' } }),
      profileStore: createProfileStoreMock(),
      ordersStore: createOrdersStoreMock(null),
      clientsStore: createClientsStoreMock(null),
      catalogStore: createCatalogStoreStub(),
      transactionsStore: createTransactionsStoreStub(),
      countersStore: createCountersStoreStub(),
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/budget/${new ObjectId().toHexString()}`,
      headers: { authorization: 'Bearer fake-token' },
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
      profileId: profileId.toHexString(),
      clientId: clientId.toHexString(),
      orderNumber: 'ORD2601009',
      status: 'draft' as const,
      paymentMethods: ['pix' as const],
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          type: 'service' as const,
          name: 'Instalacao',
          unitPrice: 120,
          unitMeasure: 'hora',
          quantity: 2,
          subtotal: 240,
          position: 0,
        },
      ],
      discount: 10,
      fees: 20,
      total: 250,
      createdAt: new Date('2026-04-10T10:00:00.000Z'),
      updatedAt: new Date('2026-04-10T10:30:00.000Z'),
      reference: 'REF-10',
    };

    const client = {
      _id: clientId,
      profileId: profileId.toHexString(),
      name: 'Cliente 1',
      type: 'individual' as const,
      document: '12345678900',
      email: 'cliente1@email.com',
      phone: '31999999999',
      address: {
        zipCode: '30110000',
        street: 'Rua B',
        number: '20',
        district: 'Centro',
        city: 'BH',
        state: 'MG',
        country: 'Brasil',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: createAuthServiceMock({ user: { id: 'auth-user-1' } }),
      profileStore: createProfileStoreMock(profileId, 'auth-user-1'),
      ordersStore: createOrdersStoreMock(order),
      clientsStore: createClientsStoreMock(client),
      catalogStore: createCatalogStoreStub(),
      transactionsStore: createTransactionsStoreStub(),
      countersStore: createCountersStoreStub(),
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/budget/${orderId.toHexString()}`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      documentType: string;
      order: { orderNumber: string };
      client: { name: string } | null;
      summary: { itemsSubtotal: number; discount: number; fees: number; total: number };
    }>();
    expect(body.documentType).toBe('budget');
    expect(body.order.orderNumber).toBe('ORD2601009');
    expect(body.client?.name).toBe('Cliente 1');
    expect(body.summary).toMatchObject({
      itemsSubtotal: 240,
      discount: 10,
      fees: 20,
      total: 250,
    });
  });

  it('returns 401 for service-order endpoint when unauthenticated', async () => {
    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: createAuthServiceMock(null),
      profileStore: createProfileStoreMock(),
      ordersStore: createOrdersStoreMock(null),
      clientsStore: createClientsStoreMock(null),
      catalogStore: createCatalogStoreStub(),
      transactionsStore: createTransactionsStoreStub(),
      countersStore: createCountersStoreStub(),
    });

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
    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: createAuthServiceMock({ user: { id: 'auth-user-1' } }),
      profileStore: createProfileStoreMock(),
      ordersStore: createOrdersStoreMock(null),
      clientsStore: createClientsStoreMock(null),
      catalogStore: createCatalogStoreStub(),
      transactionsStore: createTransactionsStoreStub(),
      countersStore: createCountersStoreStub(),
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/service-order/${new ObjectId().toHexString()}`,
      headers: { authorization: 'Bearer fake-token' },
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
      profileId: profileId.toHexString(),
      clientId: clientId.toHexString(),
      orderNumber: 'ORD2601010',
      status: 'inProgress' as const,
      paymentMethods: ['pix' as const],
      items: [
        {
          catalogItemId: new ObjectId().toHexString(),
          type: 'service' as const,
          name: 'Manutencao preventiva',
          unitPrice: 200,
          unitMeasure: 'hora',
          quantity: 1,
          subtotal: 200,
          position: 0,
        },
      ],
      discount: 0,
      fees: 15,
      total: 215,
      createdAt: new Date('2026-04-10T11:00:00.000Z'),
      updatedAt: new Date('2026-04-10T11:30:00.000Z'),
      warrantyTerms: '30 dias',
    };

    const client = {
      _id: clientId,
      profileId: profileId.toHexString(),
      name: 'Cliente 2',
      type: 'company' as const,
      document: '12345678000111',
      email: 'contato@cliente2.com',
      phone: '3133334444',
      address: {
        zipCode: '30120000',
        street: 'Rua C',
        number: '45',
        district: 'Funcionarios',
        city: 'Belo Horizonte',
        state: 'MG',
        country: 'Brasil',
      },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: createAuthServiceMock({ user: { id: 'auth-user-1' } }),
      profileStore: createProfileStoreMock(profileId, 'auth-user-1'),
      ordersStore: createOrdersStoreMock(order),
      clientsStore: createClientsStoreMock(client),
      catalogStore: createCatalogStoreStub(),
      transactionsStore: createTransactionsStoreStub(),
      countersStore: createCountersStoreStub(),
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/service-order/${orderId.toHexString()}`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      documentType: string;
      order: { orderNumber: string; status: string };
      client: { name: string } | null;
      summary: { itemsSubtotal: number; discount: number; fees: number; total: number };
    }>();
    expect(body.documentType).toBe('serviceOrder');
    expect(body.order.orderNumber).toBe('ORD2601010');
    expect(body.order.status).toBe('inProgress');
    expect(body.client?.name).toBe('Cliente 2');
    expect(body.summary).toMatchObject({
      itemsSubtotal: 200,
      discount: 0,
      fees: 15,
      total: 215,
    });
  });
});
