import { TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance } from 'fastify';

import { registerEnv, type EnvData } from './env.js';
import { createAuthService, createUnavailableAuthService, type AuthService } from './lib/auth.js';
import { createCatalogStore, type CatalogStore } from './lib/catalog.js';
import { createClientsStore, type ClientStore } from './lib/clients.js';
import { createCountersStore, type CountersStore } from './lib/counters.js';
import { mongoService, type MongoService } from './lib/mongo.js';
import { createOrdersStore, type OrdersStore } from './lib/orders.js';
import { createProfileStore, type ProfileStore } from './lib/profile.js';
import { createTransactionsStore, type TransactionsStore } from './lib/transactions.js';
import { registerGlobalErrorHandler } from './plugins/error-handler.js';
import { registerSecurityPlugins } from './plugins/security.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerCatalogRoutes } from './routes/catalog.js';
import { registerClientsRoutes } from './routes/clients.js';
import { registerDocumentsRoutes } from './routes/documents.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerOrdersRoutes } from './routes/orders.js';
import { registerProfileRoutes } from './routes/profile.js';
import { registerTransactionsRoutes } from './routes/transactions.js';

export type BuildAppOptions = {
  envData?: EnvData;
  mongo?: MongoService;
  auth?: AuthService;
  profileStore?: ProfileStore;
  catalogStore?: CatalogStore;
  clientsStore?: ClientStore;
  ordersStore?: OrdersStore;
  countersStore?: CountersStore;
  transactionsStore?: TransactionsStore;
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

  const selectedClientsStore =
    options.clientsStore ?? createClientsStore(() => selectedMongoService.getDb());

  try {
    await selectedClientsStore.ensureIndexes();
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    app.log.error({ err: normalizedError }, 'Unable to ensure clients indexes');
  }

  const selectedOrdersStore =
    options.ordersStore ?? createOrdersStore(() => selectedMongoService.getDb());

  try {
    await selectedOrdersStore.ensureIndexes();
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    app.log.error({ err: normalizedError }, 'Unable to ensure orders indexes');
  }

  const selectedCountersStore =
    options.countersStore ?? createCountersStore(() => selectedMongoService.getDb());

  const selectedTransactionsStore =
    options.transactionsStore ?? createTransactionsStore(() => selectedMongoService.getDb());

  try {
    await selectedTransactionsStore.ensureIndexes();
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    app.log.error({ err: normalizedError }, 'Unable to ensure transactions indexes');
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

  registerCatalogRoutes(app, {
    authService: selectedAuthService,
    profileStore: selectedProfileStore,
    catalogStore: selectedCatalogStore,
  });

  registerClientsRoutes(app, {
    authService: selectedAuthService,
    profileStore: selectedProfileStore,
    clientsStore: selectedClientsStore,
  });

  registerOrdersRoutes(app, {
    authService: selectedAuthService,
    profileStore: selectedProfileStore,
    catalogStore: selectedCatalogStore,
    ordersStore: selectedOrdersStore,
    countersStore: selectedCountersStore,
    transactionsStore: selectedTransactionsStore,
  });

  registerTransactionsRoutes(app, {
    authService: selectedAuthService,
    profileStore: selectedProfileStore,
    clientsStore: selectedClientsStore,
    transactionsStore: selectedTransactionsStore,
  });

  registerDocumentsRoutes(app, {
    authService: selectedAuthService,
    profileStore: selectedProfileStore,
    ordersStore: selectedOrdersStore,
    clientsStore: selectedClientsStore,
    transactionsStore: selectedTransactionsStore,
  });

  registerHealthRoutes(app, {
    isMongoHealthy: selectedMongoService.isHealthy,
    getMongoStatus: selectedMongoService.getStatus,
  });

  return app;
};