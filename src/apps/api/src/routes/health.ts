import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

type HealthDependencies = {
  isMongoHealthy: () => boolean;
  getMongoStatus: () => {
    lastError: string | null;
  };
};

const HealthOkSchema = Type.Object({
  status: Type.Literal('ok'),
});

const HealthDegradedSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  statusCode: Type.Literal(503),
});

export const registerHealthRoutes = (
  app: FastifyInstance,
  dependencies: HealthDependencies,
): void => {
  app.get(
    '/health',
    {
      schema: {
        response: {
          200: HealthOkSchema,
          503: HealthDegradedSchema,
        },
      },
    },
    async (_request, reply) => {
      if (dependencies.isMongoHealthy()) {
        return { status: 'ok' };
      }

      const mongoStatus = dependencies.getMongoStatus();

      return reply.status(503).send({
        error: 'ServiceUnavailable',
        message: mongoStatus.lastError
          ? `MongoDB is unavailable: ${mongoStatus.lastError}`
          : 'MongoDB is unavailable',
        statusCode: 503,
      });
    },
  );
};
