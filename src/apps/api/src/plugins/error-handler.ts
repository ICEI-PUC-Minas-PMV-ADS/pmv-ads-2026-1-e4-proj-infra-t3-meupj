import type { FastifyInstance } from 'fastify';

const normalizeStatusCode = (statusCode: unknown): number => {
  const parsedStatusCode =
    typeof statusCode === 'number'
      ? statusCode
      : typeof statusCode === 'string' || typeof statusCode === 'bigint'
        ? Number(statusCode)
        : Number.NaN;

  if (!Number.isInteger(parsedStatusCode)) {
    return 500;
  }

  if (parsedStatusCode < 400 || parsedStatusCode > 599) {
    return 500;
  }

  return parsedStatusCode;
};

export const registerGlobalErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error, request, reply) => {
    const normalizedError = error instanceof Error ? error : new Error('Unexpected error');
    const rawStatusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error as { statusCode?: unknown }).statusCode
        : undefined;
    const statusCode = normalizeStatusCode(rawStatusCode);

    request.log.error({ err: normalizedError, statusCode }, 'Request failed');

    void reply.status(statusCode).send({
      error: normalizedError.name || 'Error',
      message: normalizedError.message,
      statusCode,
    });
  });
};
