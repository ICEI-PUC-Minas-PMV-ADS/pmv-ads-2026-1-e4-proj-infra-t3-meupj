import { TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance } from 'fastify';

import { registerEnv, type EnvData } from './env.js';
import { createAuthService, createUnavailableAuthService, type AuthService } from './lib/auth.js';
import { createCatalogStore, type CatalogStore } from './lib/catalog.js';
import { mongoService, type MongoService } from './lib/mongo.js';
import { createProfileStore, type ProfileStore } from './lib/profile.js';
import { registerGlobalErrorHandler } from './plugins/error-handler.js';
import { registerSecurityPlugins } from './plugins/security.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerProfileRoutes } from './routes/profile.js';

export type BuildAppOptions = {
  envData?: EnvData;
  mongo?: MongoService;
  auth?: AuthService;
  profileStore?: ProfileStore;
  catalogStore?: CatalogStore;
};

const resolveInitialLogLevel = (): string => process.env.LOG_LEVEL ?? 'info';
const parseTrustedOrigins = (origins?: string): string[] => {
  if (!origins || origins.trim().length === 0) {
    return [];
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const buildApp = async (options: BuildAppOptions = {}): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: resolveInitialLogLevel(),
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  app.setValidatorCompiler(TypeBoxValidatorCompiler);

  await registerEnv(app, options.envData);

  if (app.env.LOG_LEVEL) {
    app.log.level = app.env.LOG_LEVEL;
  }

  registerGlobalErrorHandler(app);
  await registerSecurityPlugins(app);

  const selectedMongoService = options.mongo ?? mongoService;
  const mongoOptions = {
    uri: app.env.MONGODB_URI,
    logger: app.log,
    ...(app.env.MONGODB_DB_NAME ? { dbName: app.env.MONGODB_DB_NAME } : {}),
  };
  await selectedMongoService.initialize(mongoOptions);

  app.addHook('onClose', async () => {
    await selectedMongoService.close();
  });

  const selectedProfileStore =
    options.profileStore ?? createProfileStore(() => selectedMongoService.getDb());

  try {
    await selectedProfileStore.ensureIndexes();
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    app.log.error({ err: normalizedError }, 'Unable to ensure profile indexes');
  }

  const selectedCatalogStore =
    options.catalogStore ?? createCatalogStore(() => selectedMongoService.getDb());

  try {
    await selectedCatalogStore.ensureIndexes();
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    app.log.error({ err: normalizedError }, 'Unable to ensure catalog indexes');
  }

  let selectedAuthService = options.auth;

  if (!selectedAuthService) {
    try {
      selectedAuthService = createAuthService({
        db: selectedMongoService.getDb(),
        client: selectedMongoService.getClient(),
        baseURL: app.env.BETTER_AUTH_URL,
        secret: app.env.BETTER_AUTH_SECRET,
        trustedOrigins: parseTrustedOrigins(app.env.CORS_ORIGIN),
        profileStore: selectedProfileStore,
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      app.log.error(
        { err: normalizedError },
        'Unable to initialize Better Auth; authentication endpoints are unavailable',
      );
      selectedAuthService = createUnavailableAuthService();
    }
  }

  registerAuthRoutes(app, {
    authService: selectedAuthService,
  });

  registerProfileRoutes(app, {
    authService: selectedAuthService,
    profileStore: selectedProfileStore,
  });

  registerHealthRoutes(app, {
    isMongoHealthy: selectedMongoService.isHealthy,
    getMongoStatus: selectedMongoService.getStatus,
  });

  return app;
};
