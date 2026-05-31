import { CONFIG } from '../config';
import { authClient } from './auth-client';
import { Platform } from 'react-native';

let unauthorizedHandler = null;

const hasHeader = (headers, headerName) => {
  const target = headerName.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === target);
};

const parseErrorPayload = async (response) => {
  const payload = await response.json().catch(() => null);

  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.trim().length > 0
  ) {
    return {
      message: payload.message,
      payload,
    };
  }

  return {
    message: `Erro na requisição: ${response.status}`,
    payload,
  };
};

const createApiError = (message, status, payload) => {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
};

const notifyUnauthorized = () => {
  if (typeof unauthorizedHandler === 'function') {
    unauthorizedHandler();
  }
};

const resolveAuthCookie = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!authClient || typeof authClient.getCookie !== 'function') {
    return null;
  }

  try {
    const value = authClient.getCookie();
    const cookie = value instanceof Promise ? await value : value;
    return typeof cookie === 'string' && cookie.length > 0 ? cookie : null;
  } catch {
    return null;
  }
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
};

/**
 * Cliente base para chamadas API.
 * Centraliza headers, autenticação e tratamento de erros.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${CONFIG.API_URL}${endpoint}`;
  const {
    skipUnauthorizedHandler = false,
    headers: requestHeaders = {},
    ...requestOptions
  } = options;

  const headers = {
    ...requestHeaders,
  };

  const cookie = await resolveAuthCookie();

  if (cookie && cookie.length > 0 && !hasHeader(headers, 'cookie')) {
    headers.Cookie = cookie;
  }

  if (
    requestOptions.body !== undefined &&
    requestOptions.body !== null &&
    !hasHeader(headers, 'content-type')
  ) {
    headers['Content-Type'] = 'application/json';
  }

  const credentials = requestOptions.credentials ?? (cookie ? 'omit' : 'include');

  try {
    const response = await fetch(url, {
      method: requestOptions.method || 'GET',
      ...requestOptions,
      headers,
      credentials,
    });

    if (!response.ok) {
      const { message, payload } = await parseErrorPayload(response);

      if (response.status === 401 && !skipUnauthorizedHandler) {
        notifyUnauthorized();
      }

      throw createApiError(message, response.status, payload);
    }

    return await response.json().catch(() => null);
  } catch (error) {
    console.error(`Erro API [${endpoint}]:`, error);
    throw error;
  }
};
