import { apiClient, resolveApiErrorMessage } from './api-client';

type NullableString = string | null;

export interface ProfileBusinessAddress {
  zipCode: NullableString;
  street: NullableString;
  number: NullableString;
  complement: NullableString;
  district: NullableString;
  city: NullableString;
  state: NullableString;
  country: NullableString;
}

export interface ProfileBusiness {
  name: NullableString;
  document: NullableString;
  phone: NullableString;
  email: NullableString;
  logo: NullableString;
  color: NullableString;
  footer: NullableString;
  address: ProfileBusinessAddress;
}

export interface SettingsProfileResponse {
  user: {
    id: string;
    name: NullableString;
    email: NullableString;
  };
  business: ProfileBusiness;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export const SettingsService = {
  async getProfile(): Promise<SettingsProfileResponse> {
    try {
      return await apiClient.get<SettingsProfileResponse>('/api/profile', {
        cache: 'no-store',
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao carregar configurações.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  async updateBusiness(business: ProfileBusiness): Promise<SettingsProfileResponse> {
    try {
      return await apiClient.put<SettingsProfileResponse>('/api/profile', {
        body: business,
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao salvar dados da empresa.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  async updateUser(payload: UpdateUserPayload): Promise<void> {
    try {
      await apiClient.post<void>('/api/auth/update-user', {
        body: payload,
        parseAs: 'none',
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao salvar dados do usuário.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    try {
      await apiClient.post<void>('/api/auth/change-password', {
        body: payload,
        parseAs: 'none',
      });
    } catch (error) {
      throw new Error(
        resolveApiErrorMessage(error, 'Falha ao alterar senha.', {
          401: 'Não autorizado. Faça login novamente.',
        }),
      );
    }
  },
};
