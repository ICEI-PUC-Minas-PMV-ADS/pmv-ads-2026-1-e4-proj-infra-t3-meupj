import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { CONFIG } from '../config';

const isWeb = Platform.OS === 'web';

const plugins = isWeb
  ? []
  : [
      expoClient({
        scheme: 'meupj',
        storage: SecureStore,
        storagePrefix: 'meupj',
      }),
    ];

export const authClient = createAuthClient({
  baseURL: CONFIG.API_URL,
  plugins,
});
