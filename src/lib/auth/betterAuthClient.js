import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

/**
 * Cliente real de Better Auth.
 * El servidor debe registrar el plugin `expo()`, habilitar `emailAndPassword`
 * y añadir "matchai://" a `trustedOrigins`.
 */
export const betterAuthClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_AUTH_URL ?? 'http://localhost:3000',
  plugins: [
    expoClient({
      scheme: 'matchai',
      storagePrefix: 'matchai',
      storage: SecureStore,
    }),
  ],
});
