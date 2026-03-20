import fastifyEnv from '@fastify/env';
import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

const LogLevelSchema = Type.Union([
  Type.Literal('fatal'),
  Type.Literal('error'),
  Type.Literal('warn'),
  Type.Literal('info'),
  Type.Literal('debug'),
  Type.Literal('trace'),
]);

export const AppEnvSchema = Type.Object(
  {
    NODE_ENV: Type.Optional(
      Type.Union([Type.Literal('development'), Type.Literal('test'), Type.Literal('production')]),
    ),
    HOST: Type.Optional(Type.String({ minLength: 1 })),
    PORT: Type.Optional(Type.Integer({ minimum: 1, maximum: 65535 })),
    LOG_LEVEL: Type.Optional(LogLevelSchema),
    MONGODB_URI: Type.String({ minLength: 1 }),
    MONGODB_DB_NAME: Type.Optional(Type.String({ minLength: 1 })),
    BETTER_AUTH_SECRET: Type.String({ minLength: 32 }),
    BETTER_AUTH_URL: Type.String({ minLength: 1 }),
    CORS_ORIGIN: Type.Optional(Type.String({ minLength: 1 })),
    RATE_LIMIT_MAX: Type.Optional(Type.Integer({ minimum: 1 })),
    RATE_LIMIT_TIME_WINDOW: Type.Optional(Type.String({ minLength: 1 })),
  },
  {
    additionalProperties: false,
  },
);

export type AppEnv = Static<typeof AppEnvSchema>;
export type EnvData = Record<string, unknown>;

export const registerEnv = async (app: FastifyInstance, data?: EnvData): Promise<void> => {
  const options = {
    confKey: 'env',
    schema: AppEnvSchema,
    dotenv: true,
    ...(data ? { data } : {}),
  };

  await app.register(fastifyEnv, options);
};
