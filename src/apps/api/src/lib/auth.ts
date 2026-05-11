import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { fromNodeHeaders } from 'better-auth/node';
import type { IncomingHttpHeaders } from 'node:http';
import type { Db, MongoClient } from 'mongodb';

import type { ProfileStore } from './profile.js';

export type AuthSession = {
  user: {
    id: string;
    name: string | null;
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

const normalizeAuthUserId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (!isObject(value)) {
    return null;
  }

  if (typeof value.toHexString === 'function') {
    const parsed = value.toHexString();
    if (typeof parsed === 'string' && parsed.length > 0) {
      return parsed;
    }
  }

  if (typeof value.toString === 'function') {
    const parsed = value.toString();
    if (typeof parsed === 'string' && parsed.length > 0 && parsed !== '[object Object]') {
      return parsed;
    }
  }

  return null;
};

const resolveAuthUserId = (value: unknown): string => {
  if (!isObject(value)) {
    throw new Error('Invalid user payload from Better Auth hook');
  }

  const userId = normalizeAuthUserId(value.id) ?? normalizeAuthUserId(value._id);

  if (!userId) {
    throw new Error('Better Auth hook did not provide a valid user id');
  }

  return userId;
};

const parseAuthSession = (session: unknown): AuthSession | null => {
  if (!isObject(session)) {
    return null;
  }

  const user = session.user;

  if (!isObject(user)) {
    return null;
  }

  const userId = normalizeAuthUserId(user.id) ?? normalizeAuthUserId(user._id);

  if (!userId) {
    return null;
  }

  return {
    user: {
      id: userId,
      name: typeof user.name === 'string' ? user.name : null,
      email: typeof user.email === 'string' ? user.email : null,
    },
  };
};

export const createOnUserCreatedHook = (
  profileStore: Pick<ProfileStore, 'ensureByAuthUserId'>,
): ((user: unknown) => Promise<void>) => {
  return async (user: unknown): Promise<void> => {
    const authUserId = resolveAuthUserId(user);
    console.log('[AuthService] Novo usuário detectado pelo hook! Criando perfil para:', authUserId);
    await profileStore.ensureByAuthUserId(authUserId);
    console.log('[AuthService] Perfil criado com sucesso para:', authUserId);
  };
};

export const createAuthService = (options: CreateAuthServiceOptions): AuthService => {
  const trustedOrigins = Array.from(
    new Set(
      [
        options.baseURL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        ...options.trustedOrigins,
      ]
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
      transaction: false,
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
    advanced: {
      defaultCookieAttributes: {
        path: '/',
        sameSite: options.baseURL.startsWith('https') ? 'none' : 'lax',
        secure: options.baseURL.startsWith('https'),
      },
    },
  });

  return {
    handleRequest: (request: Request) => auth.handler(request),
    getSessionFromHeaders: async (headers: IncomingHttpHeaders) => {
      const nodeHeaders = fromNodeHeaders(headers);
      const session = await auth.api.getSession({
        headers: nodeHeaders,
      });

      if (!session) {
        console.log(`[AuthService] Sessão NÃO encontrada para os headers enviados.`);
      } else {
        console.log('[AuthService] Sessão validada para:', (session as any).user?.email);
      }

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
