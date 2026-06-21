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

  const configuredCorsOrigins = parseCorsOrigins(app.env.CORS_ORIGIN);

  if (configuredCorsOrigins.includes('*')) {
    app.log.warn(
      'Ignoring wildcard CORS_ORIGIN because credentialed requests require explicit origins',
    );
  }

  const corsOrigins = configuredCorsOrigins.filter((origin) => origin !== '*');

  if (corsOrigins.includes('http://localhost:3000')) {
    corsOrigins.push('http://127.0.0.1:3000');
  }

  if (corsOrigins.includes('http://127.0.0.1:3000')) {
    corsOrigins.push('http://localhost:3000');
  }

  const allowedOrigins = Array.from(new Set(corsOrigins));

  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
