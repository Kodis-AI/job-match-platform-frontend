import { createContext, useCallback, useContext, useMemo } from 'react';

import { authClient } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data, isPending } = authClient.useSession();

  const signIn = useCallback((credentials) => authClient.signIn.email(credentials), []);
  const signUp = useCallback((payload) => authClient.signUp.email(payload), []);
  const signOut = useCallback(() => authClient.signOut(), []);

  const value = useMemo(
    () => ({
      user: data?.user ?? null,
      session: data?.session ?? null,
      isAuthenticated: Boolean(data?.user),
      isPending,
      signIn,
      signUp,
      signOut,
    }),
    [data, isPending, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
