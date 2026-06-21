import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Collection, type WithId } from 'mongodb';

import { buildApp } from '../app.js';
import type { AuthService } from '../lib/auth.js';
import type { CatalogStore } from '../lib/catalog.js';
import type { ClientStore } from '../lib/clients.js';
import type { CountersStore } from '../lib/counters.js';
import type { MongoService } from '../lib/mongo.js';
import type { Order, OrdersStore } from '../lib/orders.js';
import type { ProfileBusiness, ProfileStore } from '../lib/profile.js';
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

const createMongoMock = (): MongoService => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  isHealthy: vi.fn(() => true),
  getStatus: vi.fn(() => ({ state: 'connected', lastError: null })),
  getClient: vi.fn(() => {
    throw new Error('not implemented in tests');
  }),
  getDb: vi.fn(() => {
    throw new Error('not implemented in tests');
  }),
  close: vi.fn().mockResolvedValue(undefined),
});

const EMPTY_BUSINESS: ProfileBusiness = {
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
};

const createProfileStoreMock = (profileId: ObjectId, authUserId: string): ProfileStore => ({
  ensureIndexes: vi.fn().mockResolvedValue(undefined),
  getByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: EMPTY_BUSINESS,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
  ensureByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: EMPTY_BUSINESS,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
  updateBusinessByAuthUserId: vi.fn().mockResolvedValue({
    _id: profileId,
    authUserId,
    business: EMPTY_BUSINESS,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }),
});

const createStoreStub = () => ({
  ensureIndexes: vi.fn().mockResolvedValue(undefined),
  getCollection: vi.fn(() => ({ createIndex: vi.fn().mockResolvedValue('ok') })),
});

const createClientsStoreMock = (
  records: Array<{ _id: ObjectId; profileId: string; name: string }>,
): ClientStore =>
  ({
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => ({
      find: vi.fn((filter: Record<string, unknown>) => {
        const profileId = typeof filter.profileId === 'string' ? filter.profileId : undefined;
        const objectIds =
          filter._id &&
          typeof filter._id === 'object' &&
          '$in' in filter._id &&
          Array.isArray((filter._id as { $in?: unknown[] }).$in)
            ? ((filter._id as { $in: Array<{ toHexString: () => string }> }).$in ?? []).map((id) =>
                id.toHexString(),
              )
            : [];

        const filtered = records.filter((client) => {
          if (profileId && client.profileId !== profileId) {
            return false;
          }

          if (objectIds.length > 0 && !objectIds.includes(client._id.toHexString())) {
            return false;
          }

          return true;
        });

        return {
          toArray: vi.fn().mockResolvedValue(filtered),
        };
      }),
      createIndex: vi.fn().mockResolvedValue('ok'),
    })),
  }) as unknown as ClientStore;

const createCountersStoreMock = () =>
  ({
    ensureIndexes: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn(() => ({ createIndex: vi.fn().mockResolvedValue('ok') })),
    getNextSequence: vi.fn(() => Promise.resolve(1)),
    generateOrderNumber: vi.fn(() => Promise.resolve('ORD2601001')),
  }) as unknown as CountersStore;

const applyFilter = (orders: WithId<Order>[], filter: Record<string, unknown>): WithId<Order>[] => {
  let result = orders;

  if (typeof filter.profileId === 'string') {
    result = result.filter((order) => order.profileId === filter.profileId);
  }

  if (typeof filter.clientId === 'string') {
    result = result.filter((order) => order.clientId === filter.clientId);
  }

  if (typeof filter.status === 'string') {
    result = result.filter((order) => order.status === filter.status);
  }

  if (filter.createdAt && typeof filter.createdAt === 'object') {
    const createdAt = filter.createdAt as { $gte?: Date; $lte?: Date };
    const minDate = createdAt.$gte;
    if (minDate) {
      result = result.filter((order) => order.createdAt >= minDate);
    }
    const maxDate = createdAt.$lte;
    if (maxDate) {
      result = result.filter((order) => order.createdAt <= maxDate);
    }
  }

  if (filter.$or && Array.isArray(filter.$or)) {
    const conditions = filter.$or as Record<string, unknown>[];
    result = result.filter((order) =>
      conditions.some((condition) => {
        const evaluateRegex = (value: string | undefined, expression: unknown): boolean => {
          if (!value || !expression || typeof expression !== 'object') {
            return false;
          }

          const regexDef = expression as { $regex?: string; $options?: string };
          if (!regexDef.$regex) {
            return false;
          }

          const regex = new RegExp(regexDef.$regex, regexDef.$options ?? '');
          return regex.test(value);
        };

        if (evaluateRegex(order.orderNumber, condition.orderNumber)) {
          return true;
        }

        if (evaluateRegex(order.reference, condition.reference)) {
          return true;
        }

        if (condition['items.name'] && typeof condition['items.name'] === 'object') {
          return order.items.some((item) => evaluateRegex(item.name, condition['items.name']));
        }

        return false;
      }),
    );
  }

  return result;
};

const createOrdersStoreMock = (
  records: WithId<Order>[],
): {
  store: OrdersStore;
  getPaginationCalls: () => { skip: number[]; limit: number[] };
} => {
  const skipCalls: number[] = [];
  const limitCalls: number[] = [];

  const collection = {
    findOne: vi.fn((filter: Record<string, unknown>) => {
      const orderId =
        filter._id && typeof filter._id === 'object' && 'toHexString' in filter._id
          ? (filter._id as { toHexString: () => string }).toHexString()
          : undefined;
      const profileId = typeof filter.profileId === 'string' ? filter.profileId : undefined;

      const found = records.find((order) => {
        if (orderId && order._id.toHexString() !== orderId) {
          return false;
        }
        if (profileId && order.profileId !== profileId) {
          return false;
        }
        return true;
      });

      return Promise.resolve(found ?? null);
    }),
    find: vi.fn((filter: Record<string, unknown>) => {
      let filtered = applyFilter(records, filter);

      const cursor = {
        sort: vi.fn((sortSpec: Record<string, 1 | -1>) => {
          const [sortKey, direction] = Object.entries(sortSpec)[0] ?? ['createdAt', -1];
          filtered = [...filtered].sort((left, right) => {
            const leftValue = left[sortKey as keyof Order];
            const rightValue = right[sortKey as keyof Order];

            if (leftValue instanceof Date && rightValue instanceof Date) {
              return direction === 1
                ? leftValue.getTime() - rightValue.getTime()
                : rightValue.getTime() - leftValue.getTime();
            }

            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
              return direction === 1 ? leftValue - rightValue : rightValue - leftValue;
            }

            if (typeof leftValue === 'string' && typeof rightValue === 'string') {
              return direction === 1
                ? leftValue.localeCompare(rightValue)
                : rightValue.localeCompare(leftValue);
            }

            return 0;
          });

          return cursor;
        }),
        skip: vi.fn((count: number) => {
          skipCalls.push(count);
          filtered = filtered.slice(count);
          return cursor;
        }),
        limit: vi.fn((count: number) => {
          limitCalls.push(count);
          filtered = filtered.slice(0, count);
          return cursor;
        }),
        toArray: vi.fn(() => Promise.resolve(filtered)),
      };

      return cursor;
    }),
    countDocuments: vi.fn((filter: Record<string, unknown>) =>
      Promise.resolve(applyFilter(records, filter).length),
    ),
  } as unknown as Collection<Order>;

  return {
    store: {
      ensureIndexes: vi.fn().mockResolvedValue(undefined),
      getCollection: vi.fn(() => collection),
    },
    getPaginationCalls: () => ({ skip: skipCalls, limit: limitCalls }),
  };
};

let app: FastifyInstance | undefined;

afterEach(async () => {
  if (!app) {
    return;
  }

  await app.close();
  app = undefined;
});

describe('orders list route', () => {
  it('accepts page and limit query as strings and normalizes pagination', async () => {
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const clientId = new ObjectId();
    const ordersRecords: WithId<Order>[] = [
      {
        _id: new ObjectId(),
        profileId: profileId.toHexString(),
        clientId: clientId.toHexString(),
        orderNumber: 'ORD2605001',
        reference: 'TEST-ORDER',
        status: 'draft',
        paymentMethods: [],
        items: [
          {
            catalogItemId: new ObjectId().toHexString(),
            type: 'service',
            name: 'Service Item',
            unitPrice: 150,
            unitMeasure: 'unit',
            quantity: 1,
            subtotal: 150,
            position: 0,
          },
        ],
        total: 150,
        createdAt: new Date('2026-05-01T12:00:00.000Z'),
        updatedAt: new Date('2026-05-01T12:00:00.000Z'),
      },
    ];
    const ordersStoreMock = createOrdersStoreMock(ordersRecords);

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(),
      auth: authService,
      profileStore,
      ordersStore: ordersStoreMock.store,
      catalogStore: createStoreStub() as unknown as CatalogStore,
      clientsStore: createClientsStoreMock([
        {
          _id: clientId,
          profileId: profileId.toHexString(),
          name: 'Client List Test',
        },
      ]),
      countersStore: createCountersStoreMock(),
      transactionsStore: createStoreStub() as unknown as TransactionsStore,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/orders?page=1&limit=50&sortBy=createdAt&sortOrder=desc',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      total: 1,
      page: 1,
      limit: 50,
      data: [
        {
          clientName: 'Client List Test',
          orderNumber: 'ORD2605001',
          reference: 'TEST-ORDER',
        },
      ],
    });

    const pagination = ordersStoreMock.getPaginationCalls();
    expect(pagination.skip).toEqual([0]);
    expect(pagination.limit).toEqual([50]);
  });
});

describe('orders detail route', () => {
  it('returns an order by id when it belongs to authenticated profile', async () => {
    const profileId = new ObjectId();
    const authService = createAuthServiceMock({ user: { id: 'auth-user-1' } });
    const profileStore = createProfileStoreMock(profileId, 'auth-user-1');
    const orderId = new ObjectId();
    const clientId = new ObjectId();
    const ordersRecords: WithId<Order>[] = [
      {
        _id: orderId,
        profileId: profileId.toHexString(),
        clientId: clientId.toHexString(),
        orderNumber: 'ORD2605002',
        reference: 'ORDER-DETAIL',
        status: 'draft',
        paymentMethods: [],
        items: [
          {
            catalogItemId: new ObjectId().toHexString(),
            type: 'service',
            name: 'Service Item',
            unitPrice: 90,
            unitMeasure: 'unit',
            quantity: 1,
            subtotal: 90,
            position: 0,
          },
        ],
        total: 90,
        createdAt: new Date('2026-05-02T12:00:00.000Z'),
        updatedAt: new Date('2026-05-02T12:00:00.000Z'),
      },
    ];
    const ordersStoreMock = createOrdersStoreMock(ordersRecords);

    app = await buildApp({
      envData: DEFAULT_ENV,
      mongo: createMongoMock(),
      auth: authService,
      profileStore,
      ordersStore: ordersStoreMock.store,
      catalogStore: createStoreStub() as unknown as CatalogStore,
      clientsStore: createClientsStoreMock([
        {
          _id: clientId,
          profileId: profileId.toHexString(),
          name: 'Client Detail Test',
        },
      ]),
      countersStore: createCountersStoreMock(),
      transactionsStore: createStoreStub() as unknown as TransactionsStore,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/orders/${orderId.toHexString()}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      _id: orderId.toHexString(),
      clientName: 'Client Detail Test',
      orderNumber: 'ORD2605002',
      reference: 'ORDER-DETAIL',
    });
  });
});
