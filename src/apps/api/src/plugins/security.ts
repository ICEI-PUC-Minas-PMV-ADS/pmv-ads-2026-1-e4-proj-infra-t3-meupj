import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

const parseCorsOrigins = (origins?: string): string[] | true => {
  if (!origins || origins.trim().length === 0) {
    return true;
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const registerSecurityPlugins = async (app: FastifyInstance): Promise<void> => {
  await app.register(helmet);

  await app.register(cors, {
    origin: parseCorsOrigins(app.env.CORS_ORIGIN),
    credentials: true,
  });

  await app.register(rateLimit, {
    global: true,
    max: app.env.RATE_LIMIT_MAX ?? 100,
    timeWindow: app.env.RATE_LIMIT_TIME_WINDOW ?? '1 minute',
  });
};
