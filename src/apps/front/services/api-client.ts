export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = object;
type ParseMode = 'json' | 'none' | 'text' | 'blob';
type JsonBody = object | unknown[];

type ApiRequestOptions = Omit<RequestInit, 'body' | 'credentials'> & {
  body?: BodyInit | JsonBody | null;
  parseAs?: ParseMode;
  query?: QueryParams;
};

const JSON_CONTENT_TYPE = 'application/json';

const resolveApiBaseUrl = (): string => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.');
  }

  return configuredBaseUrl.replace(/\/$/, '');
};

const buildApiUrl = (path: string, query?: QueryParams): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${resolveApiBaseUrl()}${normalizedPath}`);

  if (query) {
    Object.entries(query as Record<string, QueryValue>).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const isJsonContentType = (value: string | null): boolean =>
  value?.toLowerCase().includes(JSON_CONTENT_TYPE) ?? false;

const extractErrorMessage = (payload: unknown, fallback: string): string => {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0
  ) {
    return payload.message;
  }

  return fallback;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  if (isJsonContentType(response.headers.get('content-type'))) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
};

const isNativeBodyInit = (value: unknown): value is BodyInit => {
  if (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer
  ) {
    return true;
  }

  if (typeof ReadableStream !== 'undefined' && value instanceof ReadableStream) {
    return true;
  }

  return ArrayBuffer.isView(value);
};

const normalizeRequestBody = (
  body: ApiRequestOptions['body'],
  headers: Headers,
): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isNativeBodyInit(body)) {
    return body;
  }

  headers.set('Content-Type', JSON_CONTENT_TYPE);
  return JSON.stringify(body);
};

const request = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { body, headers: rawHeaders, parseAs = 'json', query, ...init } = options;
  const headers = new Headers(rawHeaders);
  const requestBody = normalizeRequestBody(body, headers);

  const response = await fetch(buildApiUrl(path, query), {
    ...init,
    body: requestBody,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const payload = await parseResponseBody(response);
    const fallbackMessage = `Request failed with status ${response.status}.`;
    const message = extractErrorMessage(payload, fallbackMessage);

    throw new ApiError(response.status, message, payload);
  }

  if (parseAs === 'none' || response.status === 204) {
    return undefined as T;
  }

  if (parseAs === 'text') {
    return (await response.text()) as T;
  }

  if (parseAs === 'blob') {
    return (await response.blob()) as T;
  }

  return (await parseResponseBody(response)) as T;
};

export const isApiErrorStatus = (error: unknown, status: number): error is ApiError =>
  error instanceof ApiError && error.status === status;

export const resolveApiErrorMessage = (
  error: unknown,
  fallback: string,
  overrides: Partial<Record<number, string>> = {},
): string => {
  if (error instanceof ApiError) {
    return overrides[error.status] ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const apiClient = {
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  patch: <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'PATCH' }),
  post: <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'POST' }),
  put: <T>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'PUT' }),
};
