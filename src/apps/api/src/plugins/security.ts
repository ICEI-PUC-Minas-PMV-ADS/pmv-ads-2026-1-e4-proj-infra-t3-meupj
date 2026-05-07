import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';

const parseCorsOrigins = (origins?: string): string[] => {
  if (!origins || origins.trim().length === 0) {
    return [];
  }

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const registerSecurityPlugins = async (app: FastifyInstance): Promise<void> => {
  await app.register(helmet);

  const corsOrigins = parseCorsOrigins(app.env.CORS_ORIGIN);
  
  // Ensure local development origins are always allowed
  const finalOrigins = Array.from(new Set([
    ...corsOrigins, 
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]));

  await app.register(cors, {
    origin: finalOrigins,
    credentials: true,
  });

  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.getHeader('access-control-allow-origin')) {
      reply.removeHeader('access-control-allow-credentials');
    }

    return payload;
  });

  await app.register(rateLimit, {
    global: true,
    max: app.env.RATE_LIMIT_MAX ?? 100,
    timeWindow: app.env.RATE_LIMIT_TIME_WINDOW ?? '1 minute',
  });
};
