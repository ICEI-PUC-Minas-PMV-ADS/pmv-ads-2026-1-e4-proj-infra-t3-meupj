import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApp } from '../app.js';
import type { MongoService } from '../lib/mongo.js';

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
    app = await buildApp({
      envData: {
        MONGODB_URI: 'mongodb://localhost:27017/meupj',
      },
      mongo: createMongoMock(true),
    });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('returns 503 when mongo is unavailable', async () => {
    app = await buildApp({
      envData: {
        MONGODB_URI: 'mongodb://localhost:27017/meupj',
      },
      mongo: createMongoMock(false),
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
    app = await buildApp({
      envData: {
        MONGODB_URI: 'mongodb://localhost:27017/meupj',
      },
      mongo: createMongoMock(true),
    });

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
});

describe('TypeBox validation', () => {
  it('rejects invalid payload', async () => {
    app = await buildApp({
      envData: {
        MONGODB_URI: 'mongodb://localhost:27017/meupj',
      },
      mongo: createMongoMock(true),
    });

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
