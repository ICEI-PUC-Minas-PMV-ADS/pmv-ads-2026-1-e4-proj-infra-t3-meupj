const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pmv-ads-2026-1-e4-proj-infra-t3-meupj.onrender.com';

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

const parseErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  const payload = await response.json().catch(() => null);

  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof payload.message === 'string' &&
    payload.message.length > 0
  ) {
    return payload.message;
  }

  return fallback;
};

const assertAuthorized = (response: Response): void => {
  if (response.status === 401) {
    throw new Error('Não autorizado. Faça login novamente.');
  }
};

export const SettingsService = {
  async getProfile(): Promise<SettingsProfileResponse> {
    const response = await fetch(`${BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    assertAuthorized(response);

    if (!response.ok) {
      const message = await parseErrorMessage(response, 'Falha ao carregar configurações.');
      throw new Error(message);
    }

    return response.json() as Promise<SettingsProfileResponse>;
  },

  async updateBusiness(business: ProfileBusiness): Promise<SettingsProfileResponse> {
    const response = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(business),
    });

    assertAuthorized(response);

    if (!response.ok) {
      const message = await parseErrorMessage(response, 'Falha ao salvar dados da empresa.');
      throw new Error(message);
    }

    return response.json() as Promise<SettingsProfileResponse>;
  },

  async updateUser(payload: UpdateUserPayload): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/auth/update-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    assertAuthorized(response);

    if (!response.ok) {
      const message = await parseErrorMessage(response, 'Falha ao salvar dados do usuário.');
      throw new Error(message);
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    assertAuthorized(response);

    if (!response.ok) {
      const message = await parseErrorMessage(response, 'Falha ao alterar senha.');
      throw new Error(message);
    }
  },
};
