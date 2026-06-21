import { Platform } from 'react-native';

const WEB_LOCAL_API_URL = 'http://localhost:3001';

const DEFAULT_NATIVE_API_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  default: WEB_LOCAL_API_URL,
});

const readEnvValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const resolveWebApiUrl = () => {
  const explicitWebApiUrl = readEnvValue(process.env.EXPO_PUBLIC_API_URL_WEB);

  if (explicitWebApiUrl) {
    return explicitWebApiUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return WEB_LOCAL_API_URL;
    }
  }

  return readEnvValue(process.env.EXPO_PUBLIC_API_URL) || WEB_LOCAL_API_URL;
};

const resolveApiUrl = () => {
  if (Platform.OS === 'web') {
    return resolveWebApiUrl();
  }

  return (
    readEnvValue(process.env.EXPO_PUBLIC_API_URL_NATIVE) ||
    readEnvValue(process.env.EXPO_PUBLIC_API_URL) ||
    DEFAULT_NATIVE_API_URL
  );
};

/**
 * Configurações globais da aplicação
 */
export const CONFIG = {
  // Use EXPO_PUBLIC_API_URL_WEB para sobrescrever o browser,
  // ou EXPO_PUBLIC_API_URL / EXPO_PUBLIC_API_URL_NATIVE para native.
  API_URL: resolveApiUrl(),
  TIMEOUT: 10000,
};
