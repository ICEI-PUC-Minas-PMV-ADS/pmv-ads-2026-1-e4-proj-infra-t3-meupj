import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import type { Db, MongoClient } from 'mongodb';

import type { ProfileStore } from './profile.js';

export type AuthSession = {
  user: {
    id: string;
    email: string | null;
  };
};

export type AuthService = {
  handleRequest: (request: Request) => Promise<Response>;
  getSessionFromHeaders: (headers: IncomingHttpHeaders) => Promise<AuthSession | null>;
};

type CreateAuthServiceOptions = {
  db: Db;
  client: MongoClient;
  baseURL: string;
  secret: string;
  trustedOrigins: string[];
  profileStore: Pick<ProfileStore, 'ensureByAuthUserId'>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const resolveAuthUserId = (value: unknown): string => {
  if (!isObject(value)) {
    throw new Error('Invalid user payload from Better Auth hook');
  }

  const userId = value.id;

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Better Auth hook did not provide a valid user id');
  }

  return userId;
};

const parseAuthSession = (session: unknown): AuthSession | null => {
  if (!isObject(session)) {
    return null;
  }

  const user = session.user;

  if (!isObject(user) || typeof user.id !== 'string' || user.id.length === 0) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: typeof user.email === 'string' ? user.email : null,
    },
  };
};

export const createOnUserCreatedHook = (
  profileStore: Pick<ProfileStore, 'ensureByAuthUserId'>,
): ((user: unknown) => Promise<void>) => {
  return async (user: unknown): Promise<void> => {
    const authUserId = resolveAuthUserId(user);
    await profileStore.ensureByAuthUserId(authUserId);
  };
};

export const createAuthService = (options: CreateAuthServiceOptions): AuthService => {
  const trustedOrigins = Array.from(
    new Set(
      [options.baseURL, ...options.trustedOrigins]
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  );

  const onUserCreated = createOnUserCreatedHook(options.profileStore);

  const auth = betterAuth({
    basePath: '/api/auth',
    baseURL: options.baseURL,
    secret: options.secret,
    trustedOrigins,
    database: mongodbAdapter(options.db, {
      client: options.client,
    }),
    emailAndPassword: {
      enabled: true,
    },
    databaseHooks: {
      user: {
        create: {
          after: onUserCreated,
        },
      },
    },
  });

  return {
    handleRequest: (request: Request) => auth.handler(request),
    getSessionFromHeaders: async (headers: IncomingHttpHeaders) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
      });

      return parseAuthSession(session);
    },
  };
};

const AUTH_UNAVAILABLE_PAYLOAD = Object.freeze({
  error: 'ServiceUnavailable',
  message: 'Authentication service is unavailable',
  statusCode: 503,
});

export const createUnavailableAuthService = (): AuthService => ({
  handleRequest: () =>
    Promise.resolve(
      new Response(JSON.stringify(AUTH_UNAVAILABLE_PAYLOAD), {
        status: 503,
        headers: {
          'content-type': 'application/json',
        },
      }),
    ),
  getSessionFromHeaders: () => Promise.resolve(null),
});
