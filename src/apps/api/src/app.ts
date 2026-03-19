import { TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance } from 'fastify';

import { registerEnv, type EnvData } from './env.js';
import { mongoService, type MongoService } from './lib/mongo.js';
import { registerGlobalErrorHandler } from './plugins/error-handler.js';
import { registerSecurityPlugins } from './plugins/security.js';
import { registerHealthRoutes } from './routes/health.js';

export type BuildAppOptions = {
  envData?: EnvData;
  mongo?: MongoService;
};

const resolveInitialLogLevel = (): string => process.env.LOG_LEVEL ?? 'info';

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

  registerHealthRoutes(app, {
    isMongoHealthy: selectedMongoService.isHealthy,
    getMongoStatus: selectedMongoService.getStatus,
  });

  return app;
};
