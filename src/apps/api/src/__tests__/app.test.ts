import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { ObjectId, type Db, type WithId } from 'mongodb';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../app.js';
import { createOnUserCreatedHook, type AuthService } from '../lib/auth.js';
import type { MongoService } from '../lib/mongo.js';
import { createProfileStore, type ProfileDocument, type ProfileStore } from '../lib/profile.js';

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

const createProfileStoreMock = (
  profile = createProfileFixture(),
): ProfileStore => ({
  ensureIndexes: () => Promise.resolve(undefined),
  getByAuthUserId: () => Promise.resolve(profile),
  ensureByAuthUserId: () => Promise.resolve(profile),
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

const buildTestApp = async (options?: {
  authService?: AuthService;
  profileStore?: ProfileStore;
  mongoHealthy?: boolean;
  envData?: Record<string, unknown>;
}): Promise<FastifyInstance> => {
  const authService = options?.authService ?? createAuthServiceMock();
  const profileStore = options?.profileStore ?? createProfileStoreMock();

  return buildApp({
    envData: {
      ...DEFAULT_ENV,
      ...(options?.envData ?? {}),
    },
    mongo: createMongoMock(options?.mongoHealthy ?? true),
    auth: authService,
    profileStore,
  });
};

type FakeCollection = {
  createIndex: ReturnType<typeof vi.fn>;
  updateOne: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
};

const createFakeProfileDb = (): {
  db: Db;
  records: Map<string, WithId<ProfileDocument>>;
  getCreateIndexCalls: () => number;
} => {
  const records = new Map<string, WithId<ProfileDocument>>();
  let createIndexCalls = 0;

  const collection: FakeCollection = {
    createIndex: vi.fn(() => {
      createIndexCalls += 1;
      return Promise.resolve('profile_authUserId_unique');
    }),
    updateOne: vi.fn((filter, update, options) => {
      const authUserId = (filter as { authUserId: string }).authUserId;
      const existing = records.get(authUserId);

      if (!existing && options && (options as { upsert?: boolean }).upsert) {
        const data = (update as { $setOnInsert: ProfileDocument }).$setOnInsert;
        records.set(authUserId, {
          _id: new ObjectId(),
          authUserId: data.authUserId,
          business: {
            ...data.business,
            address: { ...data.business.address },
          },
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }

      return {
        acknowledged: true,
        matchedCount: existing ? 1 : 0,
        modifiedCount: 0,
        upsertedCount: existing ? 0 : 1,
      };
    }),
    findOne: vi.fn((filter) => {
      const authUserId = (filter as { authUserId: string }).authUserId;
      return Promise.resolve(records.get(authUserId) ?? null);
    }),
  };

  const db = {
    collection: vi.fn(() => collection),
  } as unknown as Db;

  return {
    db,
    records,
    getCreateIndexCalls: () => createIndexCalls,
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

describe('health route', () => {
  it('returns 200 when mongo is healthy', async () => {
    app = await buildTestApp({
      mongoHealthy: true,
    });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('returns 503 when mongo is unavailable', async () => {
    app = await buildTestApp({
      mongoHealthy: false,
    });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: 'ServiceUnavailable',
      message: 'MongoDB is unavailable: connection refused',
      statusCode: 503,
    });
  });
});

describe('global error format', () => {
  it('uses { error, message, statusCode } pattern', async () => {
    app = await buildTestApp();

    app.get('/_test/error', () => {
      const error = new Error('forced bad request') as Error & { statusCode: number };
      error.name = 'BadRequestError';
      error.statusCode = 400;
      throw error;
    });

    const response = await app.inject({ method: 'GET', url: '/_test/error' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: 'BadRequestError',
      message: 'forced bad request',
      statusCode: 400,
    });
  });

  it('falls back to 500 when statusCode is invalid', async () => {
    app = await buildTestApp();

    app.get('/_test/error-invalid-status', () => {
      const error = new Error('forced invalid status') as Error & { statusCode: unknown };
      error.name = 'InvalidStatusError';
      error.statusCode = 'abc';
      throw error;
    });

    const response = await app.inject({ method: 'GET', url: '/_test/error-invalid-status' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: 'InvalidStatusError',
      message: 'forced invalid status',
      statusCode: 500,
    });
  });
});

describe('logging config', () => {
  it('applies LOG_LEVEL from validated env', async () => {
    app = await buildTestApp({
      envData: {
        LOG_LEVEL: 'trace',
      },
    });

    expect(app.log.level).toBe('trace');
  });
});

describe('CORS config', () => {
  it('does not enable CORS credentials without allowed origins', async () => {
    app = await buildTestApp({
      envData: {
        CORS_ORIGIN: ' ',
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'https://evil.example',
      },
    });

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
  });

  it('returns CORS credentials only for configured origins', async () => {
    app = await buildTestApp({
      envData: {
        CORS_ORIGIN: 'http://localhost:3000,http://localhost:5173',
      },
    });

    const allowed = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'http://localhost:5173',
      },
    });

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');

    const blocked = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'https://evil.example',
      },
    });

    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
    expect(blocked.headers['access-control-allow-credentials']).toBeUndefined();
  });
});

describe('TypeBox validation', () => {
  it('rejects invalid payload', async () => {
    app = await buildTestApp();

    app.post(
      '/_test/echo',
      {
        schema: {
          body: Type.Object({
            name: Type.String({ minLength: 1 }),
          }),
        },
      },
      (request) => request.body,
    );

    const response = await app.inject({
      method: 'POST',
      url: '/_test/echo',
      payload: {
        name: 42,
      },
    });

    expect(response.statusCode).toBe(400);

    const payload = response.json<{ error: string; statusCode: number; message: string }>();
    expect(payload).toMatchObject({
      error: 'Error',
      statusCode: 400,
    });
    expect(typeof payload.message).toBe('string');
    expect(payload.message.length).toBeGreaterThan(0);
  });
});

describe('auth routes', () => {
  it('forwards signup payloads to Better Auth handler', async () => {
    const handleRequest = vi.fn<(request: Request) => Promise<Response>>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ user: { id: 'new-user' } }), {
          status: 201,
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'session_token=abc; Path=/; HttpOnly',
          },
        }),
      ),
    );

    app = await buildTestApp({
      authService: createAuthServiceMock({
        handleRequest,
      }),
    });

    const payload = {
      email: 'new-user@example.com',
      password: 'Secret123!',
      name: 'New User',
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up/email',
      payload,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ user: { id: 'new-user' } });
    expect(response.headers['set-cookie']).toBeDefined();
    expect(handleRequest).toHaveBeenCalledTimes(1);

    const [forwardedRequest] = handleRequest.mock.calls[0] ?? [];

    if (!(forwardedRequest instanceof Request)) {
      throw new Error('Expected forwarded request to be available');
    }

    expect(forwardedRequest.method).toBe('POST');
    expect(new URL(forwardedRequest.url).pathname).toBe('/api/auth/sign-up/email');
    expect(await forwardedRequest.json()).toEqual(payload);
  });

  it('returns 200 for valid sign in', async () => {
    const handleRequest = vi.fn<(request: Request) => Promise<Response>>(() =>
      Promise.resolve(
        new Response(JSON.stringify({ session: { id: 'session-1' } }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'session_token=valid; Path=/; HttpOnly',
          },
        }),
      ),
    );

    app = await buildTestApp({
      authService: createAuthServiceMock({
        handleRequest,
      }),
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      payload: {
        email: 'user@example.com',
        password: 'correct-password',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ session: { id: 'session-1' } });
  });

  it('returns 401 for invalid credentials', async () => {
    const handleRequest = vi.fn<(request: Request) => Promise<Response>>(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid email or password',
            statusCode: 401,
          }),
          {
            status: 401,
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      ),
    );

    app = await buildTestApp({
      authService: createAuthServiceMock({
        handleRequest,
      }),
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in/email',
      payload: {
        email: 'user@example.com',
        password: 'wrong-password',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Invalid email or password',
      statusCode: 401,
    });
  });
});

describe('profile hook', () => {
  it('creates profile after user signup event', async () => {
    const ensureByAuthUserId = vi.fn().mockResolvedValue(createProfileFixture('new-auth-user'));
    const hook = createOnUserCreatedHook({ ensureByAuthUserId });

    await hook({ id: 'new-auth-user' });

    expect(ensureByAuthUserId).toHaveBeenCalledTimes(1);
    expect(ensureByAuthUserId).toHaveBeenCalledWith('new-auth-user');
  });
});

describe('profile route', () => {
  it('returns 401 when session is missing', async () => {
    const authService = createAuthServiceMock({
      getSessionFromHeaders: vi.fn().mockResolvedValue(null),
    });

    app = await buildTestApp({
      authService,
    });

    const response = await app.inject({ method: 'GET', url: '/profile' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Unauthorized',
      message: 'Unauthorized',
      statusCode: 401,
    });
  });

  it('returns sanitized profile for authenticated user', async () => {
    const profileFixture = createProfileFixture('auth-user-42');
    profileFixture.business.name = 'Meu PJ';
    profileFixture.business.document = '12345678000199';

    const ensureByAuthUserId = vi.fn(() => Promise.resolve(profileFixture));
    const profileStore: ProfileStore = {
      ensureIndexes: () => Promise.resolve(undefined),
      getByAuthUserId: () => Promise.resolve(profileFixture),
      ensureByAuthUserId,
    };
    const authService = createAuthServiceMock({
      getSessionFromHeaders: vi.fn().mockResolvedValue({
        user: {
          id: 'auth-user-42',
          email: 'owner@meupj.com',
        },
      }),
    });

    app = await buildTestApp({
      authService,
      profileStore,
    });

    const response = await app.inject({ method: 'GET', url: '/profile' });

    expect(response.statusCode).toBe(200);
    expect(ensureByAuthUserId).toHaveBeenCalledWith('auth-user-42');
    expect(response.json()).toEqual({
      business: {
        name: 'Meu PJ',
        document: '12345678000199',
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
      createdAt: profileFixture.createdAt.toISOString(),
      updatedAt: profileFixture.updatedAt.toISOString(),
    });

    const rawPayload = response.json<Record<string, unknown>>();
    expect(rawPayload.authUserId).toBeUndefined();
    expect(rawPayload._id).toBeUndefined();
  });
});

describe('profile store', () => {
  it('upserts profile idempotently by authUserId', async () => {
    const fakeDb = createFakeProfileDb();
    const profileStore = createProfileStore(() => fakeDb.db);

    const first = await profileStore.ensureByAuthUserId('auth-user-100');
    const second = await profileStore.ensureByAuthUserId('auth-user-100');

    expect(fakeDb.records.size).toBe(1);
    expect(second._id.toString()).toBe(first._id.toString());
    expect(second.createdAt.toISOString()).toBe(first.createdAt.toISOString());
    expect(second.updatedAt.toISOString()).toBe(first.updatedAt.toISOString());
    expect(fakeDb.getCreateIndexCalls()).toBe(1);
  });
});
