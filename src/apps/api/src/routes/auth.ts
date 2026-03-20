import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { IncomingHttpHeaders } from 'node:http';

import type { AuthService } from '../lib/auth.js';

type AuthRouteDependencies = {
  authService: AuthService;
};

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

const METHODS_WITHOUT_BODY = new Set(['GET', 'HEAD']);

const toFetchHeaders = (headers: IncomingHttpHeaders): Headers => {
  const fetchHeaders = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        fetchHeaders.append(key, item);
      }
      continue;
    }

    fetchHeaders.append(key, value);
  }

  return fetchHeaders;
};

const resolveRequestBody = (
  request: FastifyRequest,
  headers: Headers,
): RequestInit['body'] | undefined => {
  if (METHODS_WITHOUT_BODY.has(request.method.toUpperCase())) {
    return undefined;
  }

  const body = request.body;

  if (body === undefined || body === null) {
    return undefined;
  }

  headers.delete('content-length');

  if (
    typeof body === 'string' ||
    body instanceof ArrayBuffer ||
    Buffer.isBuffer(body)
  ) {
    return body;
  }

  if (ArrayBuffer.isView(body)) {
    return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  }

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return JSON.stringify(body);
};

const resolveRequestUrl = (request: FastifyRequest): URL => {
  const protocol = request.protocol;
  const host = request.headers.host ?? 'localhost';
  const path = request.raw.url ?? request.url;

  return new URL(path, `${protocol}://${host}`);
};

const extractSetCookieHeaders = (headers: Headers): string[] => {
  const headersWithSetCookie = headers as HeadersWithSetCookie;

  if (typeof headersWithSetCookie.getSetCookie === 'function') {
    return headersWithSetCookie.getSetCookie();
  }

  const fallback = headers.get('set-cookie');

  return fallback ? [fallback] : [];
};

export const registerAuthRoutes = (
  app: FastifyInstance,
  dependencies: AuthRouteDependencies,
): void => {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    handler: async (request, reply) => {
      const headers = toFetchHeaders(request.headers);
      const requestInit: RequestInit = {
        method: request.method,
        headers,
      };
      const requestBody = resolveRequestBody(request, headers);

      if (requestBody !== undefined) {
        requestInit.body = requestBody;
      }

      const authRequest = new Request(resolveRequestUrl(request), requestInit);
      const authResponse = await dependencies.authService.handleRequest(authRequest);

      reply.status(authResponse.status);

      const setCookieHeaders = extractSetCookieHeaders(authResponse.headers);

      if (setCookieHeaders.length > 0) {
        reply.header('set-cookie', setCookieHeaders);
      }

      authResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          return;
        }

        reply.header(key, value);
      });

      const responseBuffer = Buffer.from(await authResponse.arrayBuffer());

      if (responseBuffer.length === 0) {
        return reply.send();
      }

      return reply.send(responseBuffer);
    },
  });
};
