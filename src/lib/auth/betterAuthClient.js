import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const AUTH_URL = process.env.EXPO_PUBLIC_AUTH_URL;
if (!AUTH_URL) {
  throw new Error('EXPO_PUBLIC_AUTH_URL is not set. Copy .env.example to .env.');
}

/**
 * Better Auth client. The server (the `auth` service of the backend) registers the `expo()`
 * and `jwt()` plugins; `jwtClient` adds `authClient.token()`, which the API layer uses.
 */
export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [
    expoClient({
      scheme: 'matchai',
      storagePrefix: 'matchai',
      storage: SecureStore,
    }),
    jwtClient(),
  ],
});
