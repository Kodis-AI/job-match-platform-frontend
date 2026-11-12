import { betterAuthClient } from './betterAuthClient';
import { mockAuthClient } from './mockAuthClient';

/** "mock" (por defecto) usa el cliente simulado; "real" conecta con el servidor Better Auth. */
export const isMockAuth = process.env.EXPO_PUBLIC_AUTH_MODE !== 'real';

export const authClient = isMockAuth ? mockAuthClient : betterAuthClient;

export { DEMO_CREDENTIALS } from './mockAuthClient';
export { getAuthErrorMessage } from './errors';
export { PASSWORD_RULES, validateEmail, validateName, validatePassword } from './validation';
