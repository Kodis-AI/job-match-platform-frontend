import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { clearApiToken } from '../lib/api/client';
import { authClient } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data, isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const userId = data?.user.id;
  const previousUserId = useRef(userId);

  useEffect(() => {
    // Only when an identity is left behind: its API token and cached data must not reach the
    // next user. On first load there is nothing to drop, and a reset at that point would
    // cancel the requests the screens have just started.
    if (previousUserId.current && previousUserId.current !== userId) {
      clearApiToken();
      queryClient.resetQueries();
    }
    previousUserId.current = userId;
  }, [userId, queryClient]);

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
