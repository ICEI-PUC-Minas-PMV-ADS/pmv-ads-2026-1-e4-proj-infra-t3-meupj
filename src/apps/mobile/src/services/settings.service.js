import { authClient } from './auth-client';
import { apiFetch } from './api';

const UNAUTHORIZED_MESSAGE = 'Não autorizado. Faça login novamente.';

const isUnauthorizedStatus = (status) => {
  if (typeof status === 'number') {
    return status === 401;
  }

  if (typeof status === 'string') {
    return Number.parseInt(status, 10) === 401;
  }

  return false;
};

const createUnauthorizedError = () => new Error(UNAUTHORIZED_MESSAGE);

const normalizeApiError = (error, fallbackMessage) => {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    isUnauthorizedStatus(error.status)
  ) {
    return createUnauthorizedError();
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error;
  }

  return new Error(fallbackMessage);
};

const assertAuthClientResult = (result, fallbackMessage) => {
  if (result?.error) {
    if (isUnauthorizedStatus(result.error.status)) {
      throw createUnauthorizedError();
    }

    throw new Error(result.error.message || fallbackMessage);
  }
};

export const SettingsService = {
  async getProfile() {
    try {
      return await apiFetch('/api/profile', {
        method: 'GET',
      });
    } catch (error) {
      throw normalizeApiError(error, 'Falha ao carregar configurações.');
    }
  },

  async updateBusiness(business) {
    try {
      return await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(business),
      });
    } catch (error) {
      throw normalizeApiError(error, 'Falha ao salvar dados da empresa.');
    }
  },

  async updateUser(payload) {
    const result = await authClient.updateUser({
      name: payload.name,
    });

    assertAuthClientResult(result, 'Falha ao salvar dados do usuário.');
  },

  async changePassword(payload) {
    const result = await authClient.changePassword({
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      ...(payload.revokeOtherSessions !== undefined
        ? { revokeOtherSessions: payload.revokeOtherSessions }
        : {}),
    });

    assertAuthClientResult(result, 'Falha ao alterar senha.');
  },
};
