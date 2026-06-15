import { afterEach, describe, expect, it, vi } from 'vitest';
import { ObjectId, type Db, type WithId } from 'mongodb';
import type { FastifyInstance } from 'fastify';

import { buildApp } from '../app.js';
import type { AuthService } from '../lib/auth.js';
import { createCatalogStore, type CatalogItem, type CatalogStore } from '../lib/catalog.js';
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

const createCatalogItemFixture = (
  profileId: string,
  overrides?: Partial<CatalogItem>,
): WithId<CatalogItem> => ({
  _id: new ObjectId(),
  profileId,
  type: 'product',
  name: 'Sample Product',
  unitPrice: 99.99,
  unitMeasure: 'unit',
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
  updateBusinessByAuthUserId: (_authUserId, business) =>
    Promise.resolve({
      ...profile,
      business: {
        ...business,
        address: { ...business.address },
      },
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    }),
});

type FakeCollection = {
  createIndex: ReturnType<typeof vi.fn>;
  insertOne: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  updateOne: ReturnType<typeof vi.fn>;
  deleteOne: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  countDocuments: ReturnType<typeof vi.fn>;
  db: { collection: ReturnType<typeof vi.fn> };
};

const createFakeCatalogDb = (): {
  db: Db;
  records: Map<string, WithId<CatalogItem>>;
  getCreateIndexCalls: () => number;
} => {
  const records = new Map<string, WithId<CatalogItem>>();
  let createIndexCalls = 0;

  const catalogCollection: FakeCollection = {
    createIndex: vi.fn(() => {
      createIndexCalls += 1;
      return Promise.resolve('index_created');
    }),
    insertOne: vi.fn((doc: Omit<CatalogItem, '_id'>) => {
      const id = new ObjectId();
      const fullDoc: WithId<CatalogItem> = {
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
            if (
              condition.description &&
              typeof condition.description === 'object' &&
              '$regex' in condition.description
            ) {
              const regex = new RegExp((condition.description as any).$regex, (condition.description as any).$options);
              return item.description ? regex.test(item.description) : false;
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
          } else if (sortKey === 'unitPrice') {
            items.sort((a, b) =>
              sortDir === 1 ? a.unitPrice - b.unitPrice : b.unitPrice - a.unitPrice,
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
            if (
              condition.description &&
              typeof condition.description === 'object' &&
              '$regex' in condition.description
            ) {
              const regex = new RegExp((condition.description as any).$regex, (condition.description as any).$options);
              return item.description ? regex.test(item.description) : false;
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
            findOne: vi.fn(() => Promise.resolve(null)),
          };
        }
        return catalogCollection;
      }),
    },
  };

  const db = {
    collection: vi.fn((name: string) => {
      if (name === 'catalog') {
        return catalogCollection;
      }
      throw new Error(`Unknown collection: ${name}`);
    }),
  } as unknown as Db;

  return {
    db,
    records,
    getCreateIndexCalls: () => createIndexCalls,
  };
};

const buildTestApp = async (options?: {
  authService?: AuthService;
  profileStore?: ProfileStore;
  catalogStore?: CatalogStore;
  fakeDb?: ReturnType<typeof createFakeCatalogDb>;
  envData?: Record<string, unknown>;
}): Promise<FastifyInstance> => {
  const authService = options?.authService ?? createAuthServiceMock();
  const profileStore = options?.profileStore ?? createProfileStoreMock();
  const fakeDb = options?.fakeDb ?? createFakeCatalogDb();
  const catalogStore = options?.catalogStore ?? createCatalogStore(() => fakeDb.db);

  return buildApp({
    envData: {
      ...DEFAULT_ENV,
      ...(options?.envData ?? {}),
    },
    mongo: createMongoMock(true),
    auth: authService,
    profileStore,
    catalogStore,
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
describe('catalog store', () => {
  it('should create profileId index', async () => {
    const createIndexMock = vi.fn().mockResolvedValue('index_created');
    const collectionMock = { createIndex: createIndexMock };
    const dbMock = { collection: vi.fn(() => collectionMock) } as unknown as Db;
    const store = createCatalogStore(() => dbMock);

    await store.ensureIndexes();

    expect(createIndexMock).toHaveBeenCalledWith(
      { profileId: 1 },
      { name: 'catalog_profileId' },
    );
  });

  it('should create profileId and type index', async () => {
    const createIndexMock = vi.fn().mockResolvedValue('index_created');
    const collectionMock = { createIndex: createIndexMock };
    const dbMock = { collection: vi.fn(() => collectionMock) } as unknown as Db;
    const store = createCatalogStore(() => dbMock);

    await store.ensureIndexes();

    expect(createIndexMock).toHaveBeenCalledWith(
      { profileId: 1, type: 1 },
      { name: 'catalog_profileId_type' },
    );
  });

  it('should create profileId and name index', async () => {
    const createIndexMock = vi.fn().mockResolvedValue('index_created');
    const collectionMock = { createIndex: createIndexMock };
    const dbMock = { collection: vi.fn(() => collectionMock) } as unknown as Db;
    const store = createCatalogStore(() => dbMock);

    await store.ensureIndexes();

    expect(createIndexMock).toHaveBeenCalledWith(
      { profileId: 1, name: 1 },
      { name: 'catalog_profileId_name' },
    );
  });

  it('should create indexes only once for the same db', async () => {
    const fakeDb = createFakeCatalogDb();
    const store = createCatalogStore(() => fakeDb.db);

    await store.ensureIndexes();
    const firstCount = fakeDb.getCreateIndexCalls();

    await store.ensureIndexes();
    const secondCount = fakeDb.getCreateIndexCalls();

    expect(secondCount).toBe(firstCount);
  });

  it('should create indexes again for a different db instance', async () => {
    const fakeDb1 = createFakeCatalogDb();
    const fakeDb2 = createFakeCatalogDb();
    let currentDb = fakeDb1;

    const store = createCatalogStore(() => currentDb.db);

    await store.ensureIndexes();
    const firstDbIndexes = fakeDb1.getCreateIndexCalls();

    currentDb = fakeDb2;
    await store.ensureIndexes();
    const secondDbIndexes = fakeDb2.getCreateIndexCalls();

    expect(firstDbIndexes).toBeGreaterThan(0);
    expect(secondDbIndexes).toBeGreaterThan(0);
  });

  it('should return catalog collection when getCollection is called', () => {
    const fakeDb = createFakeCatalogDb();
    const store = createCatalogStore(() => fakeDb.db);

    const collection = store.getCollection();

    expect(collection).toBeDefined();
  });

  it('should use injected getDb function when getting collection', () => {
    const fakeDb = createFakeCatalogDb();
    const getDbMock = vi.fn(() => fakeDb.db);
    const store = createCatalogStore(getDbMock);

    store.getCollection();

    expect(getDbMock).toHaveBeenCalled();
  });

  it('should not create indexes as side effect of getCollection', () => {
    const fakeDb = createFakeCatalogDb();
    const store = createCatalogStore(() => fakeDb.db);

    store.getCollection();

    expect(fakeDb.getCreateIndexCalls()).toBe(0);
  });
});

// ===== GET /api/catalog TESTS =====
describe('catalog GET /api/catalog', () => {
  it('should return 401 when session is missing', async () => {
    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('should return list with default pagination', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item1 = createCatalogItemFixture(profile._id.toHexString());
    const item2 = createCatalogItemFixture(profile._id.toHexString());
    fakeDb.records.set(item1._id.toHexString(), item1);
    fakeDb.records.set(item2._id.toHexString(), item2);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.page).toBe(1);
    expect(data.limit).toBe(20);
    expect(data.total).toBe(2);
    expect(data.data.length).toBe(2);
  });

  it('should apply pagination from query params', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const items = Array.from({ length: 25 }, (_, i) =>
      createCatalogItemFixture(profile._id.toHexString(), { name: `Item ${i + 1}` }),
    );
    items.forEach((item) => fakeDb.records.set(item._id.toHexString(), item));

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/catalog?page=2&limit=10',
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.page).toBe(2);
    expect(data.limit).toBe(10);
    expect(data.total).toBe(25);
  });

  it('should cap pagination to maximum values', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const items = Array.from({ length: 250 }, (_, i) =>
      createCatalogItemFixture(profile._id.toHexString(), { name: `Item ${i + 1}` }),
    );
    items.forEach((item) => fakeDb.records.set(item._id.toHexString(), item));

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/catalog?page=999999&limit=999999',
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.page).toBe(1000);
    expect(data.limit).toBe(100);
    expect(data.total).toBe(250);
    expect(data.data.length).toBe(0);
  });

  it('should filter by type when provided', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const product = createCatalogItemFixture(profile._id.toHexString(), { type: 'product' });
    const service = createCatalogItemFixture(profile._id.toHexString(), { type: 'service' });
    fakeDb.records.set(product._id.toHexString(), product);
    fakeDb.records.set(service._id.toHexString(), service);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog?type=product' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.data.length).toBe(1);
    expect(data.data[0].type).toBe('product');
  });

  it('should apply text search on name and description', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item1 = createCatalogItemFixture(profile._id.toHexString(), { name: 'Widget' });
    const item2 = createCatalogItemFixture(profile._id.toHexString(), {
      name: 'Gadget',
      description: 'Contains widget',
    });
    fakeDb.records.set(item1._id.toHexString(), item1);
    fakeDb.records.set(item2._id.toHexString(), item2);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog?q=widget' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.total).toBe(2);
  });

  it('should ignore empty search query', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item = createCatalogItemFixture(profile._id.toHexString());
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog?q=   ' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.total).toBe(1);
  });

  it('should sort by createdAt descending by default', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item1 = createCatalogItemFixture(profile._id.toHexString(), {
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });
    const item2 = createCatalogItemFixture(profile._id.toHexString(), {
      createdAt: new Date('2026-01-02T10:00:00.000Z'),
    });
    fakeDb.records.set(item1._id.toHexString(), item1);
    fakeDb.records.set(item2._id.toHexString(), item2);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.data[0].createdAt).toBe(item2.createdAt.toISOString());
  });

  it('should return only items from authenticated user profile', async () => {
    const profile1 = createProfileFixture('auth-user-1');
    const profile2 = createProfileFixture('auth-user-2');
    const fakeDb = createFakeCatalogDb();
    const item1 = createCatalogItemFixture(profile1._id.toHexString());
    const item2 = createCatalogItemFixture(profile2._id.toHexString());
    fakeDb.records.set(item1._id.toHexString(), item1);
    fakeDb.records.set(item2._id.toHexString(), item2);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile1),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.data.length).toBe(1);
    expect(data.data[0].profileId).toBe(profile1._id.toHexString());
  });

  it('should convert ObjectId to string and dates to ISO string', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item = createCatalogItemFixture(profile._id.toHexString());
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(typeof data.data[0]._id).toBe('string');
    expect(typeof data.data[0].createdAt).toBe('string');
    expect(typeof data.data[0].updatedAt).toBe('string');
  });

  it('should include description and costPrice only when present', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const itemWithOptionals = createCatalogItemFixture(profile._id.toHexString(), {
      description: 'Has description',
      costPrice: 50.0,
    });
    const itemWithoutOptionals = createCatalogItemFixture(profile._id.toHexString());
    fakeDb.records.set(itemWithOptionals._id.toHexString(), itemWithOptionals);
    fakeDb.records.set(itemWithoutOptionals._id.toHexString(), itemWithoutOptionals);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({ method: 'GET', url: '/api/catalog' });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    const withOptionals = data.data.find((d: any) => d.description);
    const withoutOptionals = data.data.find((d: any) => !d.description);
    expect(withOptionals.description).toBe('Has description');
    expect(withOptionals.costPrice).toBe(50.0);
    expect(withoutOptionals.description).toBeUndefined();
    expect(withoutOptionals.costPrice).toBeUndefined();
  });
});

// ===== POST /api/catalog TESTS =====
describe('catalog POST /api/catalog', () => {
  it('should return 401 when session is missing', async () => {
    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'product',
        name: 'Test Product',
        unitPrice: 99.99,
        unitMeasure: 'unit',
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('should create catalog item with authenticated user profile', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'product',
        name: 'New Product',
        unitPrice: 99.99,
        unitMeasure: 'unit',
      },
    });

    expect(response.statusCode).toBe(201);
    const data = response.json();
    expect(data.profileId).toBe(profile._id.toHexString());
    expect(data.type).toBe('product');
    expect(data.name).toBe('New Product');
  });

  it('should include optional fields when provided', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'product',
        name: 'Test Product',
        unitPrice: 99.99,
        unitMeasure: 'unit',
        description: 'Test description',
        costPrice: 50.0,
      },
    });

    expect(response.statusCode).toBe(201);
    const data = response.json();
    expect(data.description).toBe('Test description');
    expect(data.costPrice).toBe(50.0);
  });

  it('should omit optional fields when not provided', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'product',
        name: 'Test Product',
        unitPrice: 99.99,
        unitMeasure: 'unit',
      },
    });

    expect(response.statusCode).toBe(201);
    const data = response.json();
    expect(data.description).toBeUndefined();
    expect(data.costPrice).toBeUndefined();
  });

  it('should reject invalid type', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'invalid',
        name: 'Test Product',
        unitPrice: 99.99,
        unitMeasure: 'unit',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject negative unitPrice', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'product',
        name: 'Test Product',
        unitPrice: -10,
        unitMeasure: 'unit',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject invalid unitMeasure', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/catalog',
      payload: {
        type: 'product',
        name: 'Test Product',
        unitPrice: 99.99,
        unitMeasure: 'invalid_measure',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

// ===== PUT /api/catalog/:itemId TESTS =====
describe('catalog PUT /api/catalog/:itemId', () => {
  it('should return 401 when session is missing', async () => {
    const itemId = new ObjectId().toHexString();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/catalog/${itemId}`,
      payload: {
        name: 'Updated Name',
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('should return 404 when item not found for profile', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const itemId = new ObjectId().toHexString();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/catalog/${itemId}`,
      payload: {
        name: 'Updated Name',
      },
    });

    expect(response.statusCode).toBe(404);
  });

  it('should update only provided fields', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item = createCatalogItemFixture(profile._id.toHexString(), {
      name: 'Original Name',
      description: 'Original Description',
    });
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/catalog/${item._id.toHexString()}`,
      payload: {
        name: 'Updated Name',
      },
    });

    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.name).toBe('Updated Name');
    expect(data.description).toBe('Original Description');
  });

  it('should reject empty body', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item = createCatalogItemFixture(profile._id.toHexString());
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/catalog/${item._id.toHexString()}`,
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('should reject invalid itemId format', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      catalogStore: createCatalogStore(() => fakeDb.db),
    });

    const response = await app.inject({
      method: 'PUT',
      url: '/api/catalog/invalid-id',
      payload: {
        name: 'Updated Name',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});

// ===== DELETE /api/catalog/:itemId TESTS =====
describe('catalog DELETE /api/catalog/:itemId', () => {
  it('should return 401 when session is missing', async () => {
    const itemId = new ObjectId().toHexString();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue(null),
      }),
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/catalog/${itemId}`,
    });

    expect(response.statusCode).toBe(401);
  });

  it('should return 404 when item not found', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const itemId = new ObjectId().toHexString();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/catalog/${itemId}`,
    });

    expect(response.statusCode).toBe(404);
  });

  it('should return 204 when item is deleted successfully', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();
    const item = createCatalogItemFixture(profile._id.toHexString());
    fakeDb.records.set(item._id.toHexString(), item);

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      fakeDb,
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/catalog/${item._id.toHexString()}`,
    });

    expect(response.statusCode).toBe(204);
  });

  it('should reject invalid itemId format', async () => {
    const profile = createProfileFixture('auth-user-1');
    const fakeDb = createFakeCatalogDb();

    app = await buildTestApp({
      authService: createAuthServiceMock({
        getSessionFromHeaders: vi.fn().mockResolvedValue({ user: { id: 'auth-user-1', email: 'test@example.com' } }),
      }),
      profileStore: createProfileStoreMock(profile),
      catalogStore: createCatalogStore(() => fakeDb.db),
    });

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/catalog/invalid-id',
    });

    expect(response.statusCode).toBe(400);
  });
});
