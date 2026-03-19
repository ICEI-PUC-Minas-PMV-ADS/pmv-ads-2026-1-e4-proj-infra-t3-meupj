import type { FastifyInstance } from 'fastify';

const normalizeStatusCode = (statusCode?: number): number => {
  if (typeof statusCode !== 'number') {
    return 500;
  }

  if (statusCode < 400 || statusCode > 599) {
    return 500;
  }

  return statusCode;
};

export const registerGlobalErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error, request, reply) => {
    const normalizedError = error instanceof Error ? error : new Error('Unexpected error');
    const statusCode = normalizeStatusCode(
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : undefined,
    );

    request.log.error({ err: normalizedError, statusCode }, 'Request failed');

    void reply.status(statusCode).send({
      error: normalizedError.name || 'Error',
      message: normalizedError.message,
      statusCode,
    });
  });
};
