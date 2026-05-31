import { afterEach, describe, expect, it, vi } from 'vitest';
import { ObjectId, type Db, type WithId } from 'mongodb';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../app.js';
import type { AuthService } from '../lib/auth.js';
import { createClientsStore, type Client, type ClientStore } from '../lib/clients.js';
import type { MongoService } from '../lib/mongo.js';
import {
  type ProfileDocument,
  type ProfileStore,
} from '../lib/profile.js';

const DEFAULT_ENV = {
  BETTER_AUTH_SECRET: '01234567890123456789012345678901',
  BETTER_AUTH_URL: 'http://localhost:3000',
  MONGODB_URI: 'mongodb://localhost:27017/meupj',
};

const createProfileFixture = (authUserId = 'auth-user-1'): WithId<ProfileDocument> => ({
  _id: new ObjectId(),
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
});

const createClientFixture = (
  profileId: string,
  overrides?: Partial<Client>,
): WithId<Client> => ({
  _id: new ObjectId(),
  profileId,
  name: 'John Doe',
  type: 'individual',
  document: '12345678909',
  email: 'john@example.com',
  phone: '11999999999',
  address: {
    zipCode: '01000000',
    street: 'Rua Direita',
    number: '123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  },
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
  ...overrides,
});

const createAuthServiceMock = (overrides: Partial<AuthService> = {}): AuthService => ({
  handleRequest:
    overrides.handleRequest ??
    (() =>
      Promise.resolve(
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }),
      )),
  getSessionFromHeaders: overrides.getSessionFromHeaders ?? (() => Promise.resolve(null)),
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

const createProfileStoreMock = (profile = createProfileFixture()): ProfileStore => ({
  ensureIndexes: () => Promise.resolve(undefined),
  getByAuthUserId: () => Promise.resolve(profile),
  ensureByAuthUserId: () => Promise.resolve(profile),
});

type FakeCollection = {
  indexes: ReturnType<typeof vi.fn>;
  dropIndex: ReturnType<typeof vi.fn>;
  createIndex: ReturnType<typeof vi.fn>;
  insertOne: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  updateOne: ReturnType<typeof vi.fn>;
  deleteOne: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
  db: { collection: ReturnType<typeof vi.fn> };
};

const createFakeClientsDb = (): {
  db: Db;
  records: Map<string, WithId<Client>>;
  ordersRecords: Map<string, any>;
  getCreateIndexCalls: () => number;
} => {
  const records = new Map<string, WithId<Client>>();
  const ordersRecords = new Map<string, any>();
  let createIndexCalls = 0;

  const clientsCollection: FakeCollection = {
    indexes: vi.fn(() =>
      Promise.resolve([
        { name: '_id_' },
        { name: 'clients_profileId' },
        { name: 'clients_profileId_name' },
        { name: 'clients_profileId_email' },
      ]),
    ),
    dropIndex: vi.fn(() => Promise.resolve(undefined)),
    createIndex: vi.fn(() => {
      createIndexCalls += 1;
      return Promise.resolve('index_created');
    }),
    insertOne: vi.fn((doc: Omit<Client, '_id'>) => {
      const id = new ObjectId();
      const fullDoc: WithId<Client> = {
        _id: id,
        ...doc,
      };
      records.set(id.toHexString(), fullDoc);
      return Promise.resolve({ insertedId: id, acknowledged: true });
    }),
    findOne: vi.fn((filter: Record<string, unknown>) => {
      if (filter._id instanceof ObjectId) {
        const item = records.get(filter._id.toHexString());
        if (filter.profileId && item && item.profileId !== filter.profileId) {
          return Promise.resolve(null);
        }
        return Promise.resolve(item ?? null);
      }
      return Promise.resolve(null);
    }),
    updateOne: vi.fn((filter: Record<string, unknown>, update: { $set: Record<string, unknown> }) => {
      let matched = false;
      let updated = false;

      if (filter._id instanceof ObjectId) {
        const item = records.get(filter._id.toHexString());
        if (item && (!filter.profileId || item.profileId === filter.profileId)) {
          matched = true;
          Object.assign(item, update.$set);
          updated = true;
        }
      }

      return Promise.resolve({
        acknowledged: true,
        matchedCount: matched ? 1 : 0,
        modifiedCount: updated ? 1 : 0,
        upsertedId: null,
      });
    }),
    deleteOne: vi.fn((filter: Record<string, unknown>) => {
      if (filter._id instanceof ObjectId) {
        const id = filter._id.toHexString();
        const item = records.get(id);
        if (item && (!filter.profileId || item.profileId === filter.profileId)) {
          records.delete(id);
          return Promise.resolve({ deletedCount: 1, acknowledged: true });
        }
      }
      return Promise.resolve({ deletedCount: 0, acknowledged: true });
    }),
    find: vi.fn((filter: Record<string, unknown>) => {
      let items = Array.from(records.values());

      if (filter.profileId) {
        items = items.filter((item) => item.profileId === filter.profileId);
      }

      if (filter.type) {
        items = items.filter((item) => item.type === filter.type);
      }

      if (filter.$or) {
        const orConditions = filter.$or as Array<Record<string, unknown>>;
        items = items.filter((item) => {
          return orConditions.some((condition) => {
            if (condition.name && typeof condition.name === 'object' && '$regex' in condition.name) {
              const regex = new RegExp((condition.name as any).$regex, (condition.name as any).$options);
              return regex.test(item.name);
            }
            if (condition.email && typeof condition.email === 'object' && '$regex' in condition.email) {
              const regex = new RegExp((condition.email as any).$regex, (condition.email as any).$options);
              return regex.test(item.email);
            }
            if (condition.document && typeof condition.document === 'object' && '$regex' in condition.document) {
              const regex = new RegExp((condition.document as any).$regex, (condition.document as any).$options);
              return regex.test(item.document);
            }
            return false;
          });
        });
      }

      const cursor = {
        sort: vi.fn((sortSpec: Record<string, number>) => {
          const sortKey = Object.keys(sortSpec)[0] as string | undefined;
          if (!sortKey) {
            return cursor;
          }

          const sortDir = sortSpec[sortKey] ?? -1;
          if (sortKey === 'createdAt') {
            items.sort((a, b) =>
              sortDir === 1
                ? a.createdAt.getTime() - b.createdAt.getTime()
                : b.createdAt.getTime() - a.createdAt.getTime(),
            );
          } else if (sortKey === 'name') {
            items.sort((a, b) =>
              sortDir === 1 ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
            );
          } else if (sortKey === 'email') {
            items.sort((a, b) =>
              sortDir === 1 ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email),
            );
          }

          return cursor;
        }),
        skip: vi.fn((count: number) => {
          items = items.slice(count);
          return cursor;
        }),
        limit: vi.fn((count: number) => {
          items = items.slice(0, count);
          return cursor;
        }),
        toArray: vi.fn(() => Promise.resolve(items)),
      };

      return cursor;
    }),
    countDocuments: vi.fn((filter: Record<string, unknown>) => {
      let items = Array.from(records.values());

      if (filter.profileId) {
        items = items.filter((item) => item.profileId === filter.profileId);
      }

      if (filter.type) {
        items = items.filter((item) => item.type === filter.type);
      }

      if (filter.$or) {
        const orConditions = filter.$or as Array<Record<string, unknown>>;
        items = items.filter((item) => {
          return orConditions.some((condition) => {
            if (condition.name && typeof condition.name === 'object' && '$regex' in condition.name) {
              const regex = new RegExp((condition.name as any).$regex, (condition.name as any).$options);
              return regex.test(item.name);
            }
            if (condition.email && typeof condition.email === 'object' && '$regex' in condition.email) {
              const regex = new RegExp((condition.email as any).$regex, (condition.email as any).$options);
              return regex.test(item.email);
            }
            if (condition.document && typeof condition.document === 'object' && '$regex' in condition.document) {
              const regex = new RegExp((condition.document as any).$regex, (condition.document as any).$options);
              return regex.test(item.document);
            }
            return false;
          });
        });
      }

      return Promise.resolve(items.length);
    }),
    db: {
      collection: vi.fn((name: string) => {
        if (name === 'orders') {
          return {
            findOne: vi.fn((filter: any) => {
              if (filter.clientId) {
                const found = Array.from(ordersRecords.values()).find((o) => o.clientId === filter.clientId);
                return Promise.resolve(found || null);
              }
              return Promise.resolve(null);
            }),
          };
        }
        return clientsCollection;
      }),
    },
  };

  const db = {
    collection: vi.fn((name: string) => {
      if (name === 'clientes') {
        return clientsCollection;
      }
      throw new Error(`Unknown collection: ${name}`);
    }),
  } as unknown as Db;

  return {
    db,
    records,
    ordersRecords,
    getCreateIndexCalls: () => createIndexCalls,
  };
};

const buildTestApp = async (options?: {
  authService?: AuthService;
  profileStore?: ProfileStore;
  clientsStore?: ClientStore;
  fakeDb?: ReturnType<typeof createFakeClientsDb>;
  envData?: Record<string, unknown>;
}): Promise<FastifyInstance> => {
  const authService = options?.authService ?? createAuthServiceMock();
  const profileStore = options?.profileStore ?? createProfileStoreMock();
  const fakeDb = options?.fakeDb ?? createFakeClientsDb();
  const clientsStore = options?.clientsStore ?? createClientsStore(() => fakeDb.db);

  return buildApp({
    envData: {
      ...DEFAULT_ENV,
      ...(options?.envData ?? {}),
    },
    mongo: createMongoMock(true),
    auth: authService,
    profileStore,
    clientsStore,
  });
};

let app: FastifyInstance | undefined;

afterEach(async () => {
  if (!app) {
    return;
  }

  await app.close();
  app = undefined;
});

// ===== STORE TESTS =====
describe('clients store', () => {
  it('should create indexes correctly', async () => {
    const createIndexMock = vi.fn().mockResolvedValue('index_created');
    const collectionMock = {
      indexes: vi.fn().mockResolvedValue([{ name: '_id_' }]),
      dropIndex: vi.fn().mockResolvedValue(undefined),
      createIndex: createIndexMock,
    };
    const dbMock = { collection: vi.fn(() => collectionMock) } as unknown as Db;
    const store = createClientsStore(() => dbMock);

    await store.ensureIndexes();

    expect(createIndexMock).toHaveBeenCalledWith({ profileId: 1 }, { name: 'clients_profileId' });
    expect(createIndexMock).toHaveBeenCalledWith({ profileId: 1, name: 1 }, { name: 'clients_profileId_name' });
    expect(createIndexMock).toHaveBeenCalledWith(
      { profileId: 1, document: 1 },
      { name: 'clients_profileId_document', unique: true, sparse: true },
    );
    expect(createIndexMock).toHaveBeenCalledWith(
      { profileId: 1, email: 1 },
      { name: 'clients_profileId_email', sparse: true },
    );
  });

  it('should create indexes only once for the same db', async () => {
    const fakeDb = createFakeClientsDb();
    const store = createClientsStore(() => fakeDb.db);

    await store.ensureIndexes();
    const firstCount = fakeDb.getCreateIndexCalls();

    await store.ensureIndexes();
    const secondCount = fakeDb.getCreateIndexCalls();

    expect(secondCount).toBe(firstCount);
  });

  it('should return clients collection when getCollection is called', () => {
    const fakeDb = createFakeClientsDb();
    const store = createClientsStore(() => fakeDb.db);

    const collection = store.getCollection();

    expect(collection).toBeDefined();
  });
});

// ===== GET /api/clients TESTS =====
describe('clients GET /api/clients', () => {
  it('should return 401 when session is missing', async () => {
    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await app.inject({ method: 'GET', url: '/api/clients' });

    expect(response.statusCode).toBe(401);
  });

  it('should return list with default pagination', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item1 = createClientFixture(profile._id.toHexString());
    const item2 = createClientFixture(profile._id.toHexString());
    fakeDb.records.set(item1._id.toHexString(), item1);
    fakeDb.records.set(item2._id.toHexString(), item2);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/clients' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.page).toBe(1);
    expect(data.limit).toBe(20);
    expect(data.total).toBe(2);
    expect(data.data.length).toBe(2);
  });

  it('should apply pagination and text search', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item1 = createClientFixture(profile._id.toHexString(), { name: 'Alice' });
    const item2 = createClientFixture(profile._id.toHexString(), { name: 'Alicia' });
    const item3 = createClientFixture(profile._id.toHexString(), { name: 'Bob' });
    fakeDb.records.set(item1._id.toHexString(), item1);
    fakeDb.records.set(item2._id.toHexString(), item2);
    fakeDb.records.set(item3._id.toHexString(), item3);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/clients?q=ali' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.total).toBe(2);
    expect(data.data.length).toBe(2);
  });
});

// ===== GET /api/clients/:clientId TESTS =====
describe('clients GET /api/clients/:clientId', () => {
  it('should return a client by id when it belongs to the authenticated profile', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item = createClientFixture(profile._id.toHexString(), { name: 'Cliente Detalhe' });
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/clients/${item._id.toHexString()}`,
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data._id).toBe(item._id.toHexString());
    expect(data.name).toBe('Cliente Detalhe');
  });

  it('should return 404 when client does not exist for the authenticated profile', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/clients/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(404);
  });
});

// ===== POST /api/clients TESTS =====
describe('clients POST /api/clients', () => {
  it('should return 401 when session is missing', async () => {
    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/clients',
      payload: {
        name: 'John',
        type: 'individual',
        document: '12345678909',
        email: 'john@example.com',
        phone: '11999999999',
        address: { zipCode: '000', street: 'Street', number: '1', district: 'A', city: 'B', state: 'SP' },
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('should create client validation error when document is invalid for individual', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/clients',
      payload: {
        name: 'John',
        type: 'individual',
        document: '11111111111', // Invalid CPF (all same digits)
        email: 'john@example.com',
        phone: '11999999999',
        address: { zipCode: '000', street: 'Street', number: '1', district: 'A', city: 'B', state: 'SP' },
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should create client with valid individual document', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/clients',
      payload: {
        name: 'John Doe',
        type: 'individual',
        document: '12345678909',
        email: 'john@example.com',
        phone: '11999999999',
        address: { zipCode: '000', street: 'Street', number: '1', district: 'A', city: 'B', state: 'SP' },
      },
    });

    expect(response.statusCode).toBe(201);
    const data = response.json();
    expect(data.name).toBe('John Doe');
    expect(data.document).toBe('12345678909');
  });

  it('should create client with valid company document', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/clients',
      payload: {
        name: 'Company Inc',
        type: 'company',
        document: '12345678901234',
        email: 'contact@company.com',
        phone: '11999999999',
        address: { zipCode: '000', street: 'Street', number: '1', district: 'A', city: 'B', state: 'SP' },
      },
    });

    expect(response.statusCode).toBe(201);
  });
});

// ===== PUT /api/clients/:clientId TESTS =====
describe('clients PUT /api/clients/:clientId', () => {
  it('should update an existing client', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item = createClientFixture(profile._id.toHexString(), { name: 'Old Name', document: '12345678909' });
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/clients/${item._id.toHexString()}`,
      payload: {
        name: 'New Name',
        document: '98765432101', // Should still be validated
      },
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.name).toBe('New Name');
    expect(data.document).toBe('98765432101');
  });

  it('should fail update with invalid document', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item = createClientFixture(profile._id.toHexString(), { name: 'Old Name' });
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/clients/${item._id.toHexString()}`,
      payload: {
        document: '11111111111',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should return 404 for non-existent client update', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/clients/${new ObjectId().toHexString()}`,
      payload: {
        name: 'Something',
      },
    });

    expect(response.statusCode).toBe(404);
  });
});

// ===== DELETE /api/clients/:clientId TESTS =====
describe('clients DELETE /api/clients/:clientId', () => {
  it('should delete a valid client', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item = createClientFixture(profile._id.toHexString());
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/clients/${item._id.toHexString()}`,
    });

    expect(response.statusCode).toBe(204);
    expect(fakeDb.records.has(item._id.toHexString())).toBe(false);
  });

  it('should fail delete when client is linked to an order', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();
    const item = createClientFixture(profile._id.toHexString());
    fakeDb.records.set(item._id.toHexString(), item);
    fakeDb.ordersRecords.set('order-1', { clientId: item._id.toHexString() });

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/clients/${item._id.toHexString()}`,
    });

    expect(response.statusCode).toBe(409);
    expect(fakeDb.records.has(item._id.toHexString())).toBe(true);
  });

  it('should return 404 for non-existent client delete', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeClientsDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/clients/${new ObjectId().toHexString()}`,
    });

    expect(response.statusCode).toBe(404);
  });
});
