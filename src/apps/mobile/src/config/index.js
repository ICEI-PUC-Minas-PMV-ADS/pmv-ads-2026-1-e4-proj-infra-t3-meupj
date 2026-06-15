import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  default: 'http://localhost:3001',
});

/**
 * Configurações globais da aplicação
 */
export const CONFIG = {
  // Defina EXPO_PUBLIC_API_URL para ambientes diferentes do local.
  // Exemplo: EXPO_PUBLIC_API_URL=http://192.168.1.5:3001
  API_URL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  TIMEOUT: 10000,
};
