import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Collection, type WithId } from 'mongodb';

import { buildApp } from '../app.js';
import type { AuthService } from '../lib/auth.js';
import type { CatalogStore } from '../lib/catalog.js';
import type { Client, ClientStore } from '../lib/clients.js';
import type { CountersStore } from '../lib/counters.js';
import type { OrdersStore } from '../lib/orders.js';
import type { ProfileStore } from '../lib/profile.js';
import type { Transaction, TransactionsStore } from '../lib/transactions.js';
import type { MongoService } from '../lib/mongo.js';

const DEFAULT_ENV = {
  BETTER_AUTH_SECRET: '01234567890123456789012345678901',
  BETTER_AUTH_URL: 'http://localhost:3000',
  MONGODB_URI: 'mongodb://localhost:27017/meupj',
};

const createAuthServiceMock = (session: unknown): AuthService => ({
  handleRequest: () => Promise.resolve(new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'content-type': 'application/json' } })),
  getSessionFromHeaders: vi.fn().mockResolvedValue(session),
});

const createMongoMock = (healthy: boolean): MongoService => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  isHealthy: vi.fn(() => healthy),
  getStatus: vi.fn(() => ({ state: healthy ? ('connected' as const) : ('degraded' as const), lastError: healthy ? null : 'connection refused' })),
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
  getByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: {
      name: null,
      document: null,
      phone: null,
      email: null,
      logo: null,
      color: null,
      footer: null,
      address: {
        zipCode: null,
        street: null,
        number: null,
        complement: null,
        district: null,
        city: null,
        state: null,
        country: null,
      },
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
  ensureByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: {
      name: null,
      document: null,
      phone: null,
      email: null,
      logo: null,
      color: null,
      footer: null,
      address: {
        zipCode: null,
        street: null,
        number: null,
        complement: null,
        district: null,
        city: null,
        state: null,
        country: null,
      },
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
});

const createNoOpCollection = () => ({
  createIndex: vi.fn().mockResolvedValue('ok'),
});

type ClientCollectionFilter = {
  _id: { toHexString: () => string };
  profileId: string;
};

type TransactionQuery = {
  _id?: { toHexString: () => string };
  profileId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
};

type TransactionUpdateQuery = {
  _id: { toHexString: () => string };
  profileId: string;
};

type TransactionUpdatePayload = {
  $set: Partial<Transaction>;
};

type TransactionDeleteResult = {
  deletedCount: number;
};

const createClientsStoreMock = (profileId: string, clientId?: string): ClientStore => {
  const client = clientId
    ? {
        _id: new ObjectId(clientId),
        profileId,
        name: 'Test Client',
        type: 'individual' as const,
        document: '00000000000',
        email: null,
        phone: null,
        address: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }
    : null;

  const clientsCollection = {
    findOne: vi.fn((filter: ClientCollectionFilter) =>
      client
        ? Promise.resolve(
            filter._id.toHexString() === client._id.toHexString() && filter.profileId === client.profileId
              ? client
              : null,
          )
        : Promise.resolve(null),
    ),
  } as unknown as Collection<Client>;

  return {
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => clientsCollection),
  };
};

const createTransactionsStoreMock = (): TransactionsStore => {
  const records = new Map<string, WithId<Transaction>>();

  const transactionsCollection = {
    insertOne: vi.fn((document: Transaction) => {
      const insertedId = new ObjectId();
      const stored = {
        _id: insertedId,
        ...document,
      };
      records.set(insertedId.toHexString(), stored);
      return { insertedId };
    }),
    findOne: vi.fn((query: TransactionQuery) =>
      Promise.resolve(
        Array.from(records.values()).find((record) => {
          if (query._id && record._id.toHexString() !== query._id.toHexString()) return false;
          if (typeof query.profileId === 'string' && record.profileId !== query.profileId) return false;
          if (query.status && record.status !== query.status) return false;
          return true;
        }) ?? null,
      ),
    ),
    find: vi.fn((filter: Record<string, unknown>) => {
      const self = {
        sort: vi.fn(function (this: typeof self) {
          return this;
        }),
        skip: vi.fn(function (this: typeof self) {
          return this;
        }),
        limit: vi.fn(function (this: typeof self) {
          return this;
        }),
        toArray: vi.fn((): Promise<WithId<Transaction>[]> => {
          const allRecords = Array.from(records.values());
          const filtered = allRecords.filter((record) => {
            if (typeof filter.profileId === 'string' && record.profileId !== filter.profileId) return false;
            if (typeof filter.type === 'string' && record.type !== filter.type) return false;
            if (typeof filter.status === 'string' && record.status !== filter.status) return false;
            return true;
          });
          return Promise.resolve(filtered);
        }),
      };
      return self as unknown as Collection<Transaction>;
    }),
    countDocuments: vi.fn((filter: Record<string, unknown>) => {
      const allRecords = Array.from(records.values());
      const count = allRecords.filter((record) => {
        if (typeof filter.profileId === 'string' && record.profileId !== filter.profileId) return false;
        if (typeof filter.type === 'string' && record.type !== filter.type) return false;
        if (typeof filter.status === 'string' && record.status !== filter.status) return false;
        return true;
      }).length;
      return Promise.resolve(count);
    }),
    updateOne: vi.fn((query: TransactionUpdateQuery, payload: TransactionUpdatePayload) => {
      const existing = records.get(query._id.toHexString());

      if (!existing || existing.profileId !== query.profileId) {
        return Promise.resolve({ matchedCount: 0, modifiedCount: 0 });
      }

      const updated: WithId<Transaction> = {
        ...existing,
        ...payload.$set,
      };

      records.set(existing._id.toHexString(), updated);

      return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
    }),
    deleteOne: vi.fn((query: TransactionUpdateQuery): Promise<TransactionDeleteResult> => {
      const existing = records.get(query._id.toHexString());

      if (!existing || existing.profileId !== query.profileId) {
        return Promise.resolve({ deletedCount: 0 });
      }

      records.delete(query._id.toHexString());

      return Promise.resolve({ deletedCount: 1 });
    }),
  } as unknown as Collection<Transaction>;

  return {
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => transactionsCollection),
  };
};

const createStoreStub = () => ({
  ensureIndexes: vi.fn().mockResolvedValue(undefined),
  getCollection: vi.fn(() => createNoOpCollection()),
});

const createCountersStoreMock = () => ({
  ensureIndexes: vi.fn().mockResolvedValue(undefined),
  getCollection: vi.fn(() => createNoOpCollection()),
  getNextSequence: vi.fn(() => Promise.resolve(1)),
  generateOrderNumber: vi.fn(() => Promise.resolve('ORD2601001')),
});

let app: FastifyInstance | undefined;

afterEach(async () => {
  if (app) {
    await app.close();
    app = undefined;
  }
});

describe('transactions routes', () => {
  it('creates an income transaction for an authenticated profile', async () => {
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString(), clientId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();
    const response = await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      headers: {
        authorization: 'Bearer fake-token',
      },
      payload: {
        clientId: clientId.toHexString(),
        amount: 1500,
        transactionDate: now,
        dueDate: now,
        paymentMethod: 'pix',
        category: 'Service',
        reference: 'INV-001',
        notes: 'Invoice payment',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      profileId: profileId.toHexString(),
      clientId: clientId.toHexString(),
      type: 'income',
      status: 'pending',
      paymentMethod: 'pix',
      amount: 1500,
      transactionDate: now,
      dueDate: now,
      category: 'Service',
      reference: 'INV-001',
      notes: 'Invoice payment',
    });
  });

  it('returns 400 when clientId does not belong to the authenticated profile', async () => {
    const profileId = new ObjectId();
    const otherClientId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      headers: {
        authorization: 'Bearer fake-token',
      },
      payload: {
        clientId: otherClientId.toHexString(),
        amount: 100,
        transactionDate: '2026-01-10T12:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'Bad Request',
      message: 'Client not found or does not belong to this profile',
      statusCode: 400,
    });
  });

  it('creates an expense transaction for an authenticated profile', async () => {
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString(), clientId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();
    const response = await app.inject({
      method: 'POST',
      url: '/api/transactions/expense',
      headers: {
        authorization: 'Bearer fake-token',
      },
      payload: {
        clientId: clientId.toHexString(),
        amount: 750,
        transactionDate: now,
        dueDate: now,
        paymentMethod: 'bankTransfer',
        category: 'Supplies',
        reference: 'EXP-001',
        notes: 'Office supplies purchase',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      profileId: profileId.toHexString(),
      clientId: clientId.toHexString(),
      type: 'expense',
      status: 'pending',
      paymentMethod: 'bankTransfer',
      amount: 750,
      transactionDate: now,
      dueDate: now,
      category: 'Supplies',
      reference: 'EXP-001',
      notes: 'Office supplies purchase',
    });
  });

  it('returns 401 when the request is unauthenticated', async () => {
    const authService = createAuthServiceMock(null);
    const profileStore = createProfileStoreMock();
    const clientsStore = createClientsStoreMock('profile-1');
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      payload: {
        amount: 100,
        transactionDate: '2026-01-10T12:00:00.000Z',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('lists transactions with pagination', async () => {
      // eslint-disable @typescript-eslint/no-unnecessary-type-assertion
    const profileId = new ObjectId();
    const clientId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString(), clientId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();

    // Create two transactions
    await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      headers: { authorization: 'Bearer fake-token' },
      payload: {
        clientId: clientId.toHexString(),
        amount: 1000,
        transactionDate: now,
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/transactions/expense',
      headers: { authorization: 'Bearer fake-token' },
      payload: {
        amount: 500,
        transactionDate: now,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/transactions',
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Record<string, unknown>;
    expect(body).toMatchObject({
      page: 1,
      limit: 20,
      total: 2,
    });
    expect((body.data as WithId<Transaction>[]).length).toBe(2);
  });

  it('filters transactions by type', async () => {
      // eslint-disable @typescript-eslint/no-unnecessary-type-assertion
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();

    // Create income and expense
    await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      headers: { authorization: 'Bearer fake-token' },
      payload: { amount: 1000, transactionDate: now },
    });

    await app.inject({
      method: 'POST',
      url: '/api/transactions/expense',
      headers: { authorization: 'Bearer fake-token' },
      payload: { amount: 500, transactionDate: now },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/transactions?type=income',
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as Record<string, unknown>;
    expect(body.page).toBe(1);
    const data = body.data as WithId<Transaction>[];
    expect(data.length).toBe(1);
    expect(data[0].type).toBe('income');
  });

  it('updates a transaction by id within the profile scope', async () => {
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();
    const created = await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      headers: { authorization: 'Bearer fake-token' },
      payload: { amount: 1000, transactionDate: now, category: 'Initial' },
    });

    const createdBody = created.json() as { _id: string };
    const updated = await app.inject({
      method: 'PUT',
      url: `/api/transactions/${createdBody._id}`,
      headers: { authorization: 'Bearer fake-token' },
      payload: { amount: 1450, category: 'Updated', status: 'cancelled' },
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({
      _id: createdBody._id,
      amount: 1450,
      category: 'Updated',
      status: 'cancelled',
    });
  });

  it('confirms a transaction and keeps confirm operation idempotent', async () => {
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();
    const created = await app.inject({
      method: 'POST',
      url: '/api/transactions/expense',
      headers: { authorization: 'Bearer fake-token' },
      payload: { amount: 500, transactionDate: now },
    });

    const createdBody = created.json() as { _id: string };

    const firstConfirm = await app.inject({
      method: 'PATCH',
      url: `/api/transactions/${createdBody._id}/confirm`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(firstConfirm.statusCode).toBe(200);
    expect(firstConfirm.json()).toMatchObject({ status: 'confirmed' });

    const secondConfirm = await app.inject({
      method: 'PATCH',
      url: `/api/transactions/${createdBody._id}/confirm`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(secondConfirm.statusCode).toBe(200);
    expect(secondConfirm.json()).toMatchObject({ status: 'confirmed' });
  });

  it('returns 409 when deleting a confirmed transaction', async () => {
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const now = new Date('2026-01-10T12:00:00.000Z').toISOString();
    const created = await app.inject({
      method: 'POST',
      url: '/api/transactions/income',
      headers: { authorization: 'Bearer fake-token' },
      payload: { amount: 900, transactionDate: now },
    });

    const createdBody = created.json() as { _id: string };

    await app.inject({
      method: 'PATCH',
      url: `/api/transactions/${createdBody._id}/confirm`,
      headers: { authorization: 'Bearer fake-token' },
    });

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/transactions/${createdBody._id}`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(deleteResponse.statusCode).toBe(409);
    expect(deleteResponse.json()).toEqual({
      error: 'Conflict',
      message: 'Confirmed transaction cannot be deleted',
      statusCode: 409,
    });
  });

  it('returns 404 when transaction does not exist in profile scope', async () => {
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientsStore = createClientsStoreMock(profileId.toHexString());
    const transactionsStore = createTransactionsStoreMock();
    const catalogStore = createStoreStub() as unknown as CatalogStore;
    const ordersStore = createStoreStub() as unknown as OrdersStore;
    const countersStore = createCountersStoreMock() as unknown as CountersStore;

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(true),
      auth: authService,
      profileStore,
      clientsStore,
      catalogStore,
      ordersStore,
      countersStore,
      transactionsStore,
    });

    const missingId = new ObjectId().toHexString();

    const response = await app.inject({
      method: 'PATCH',
      url: `/api/transactions/${missingId}/confirm`,
      headers: { authorization: 'Bearer fake-token' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: 'Not Found',
      message: 'Transaction not found',
      statusCode: 404,
    });
  });
});
