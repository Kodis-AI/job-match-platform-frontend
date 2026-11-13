import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api/client';
import { fontAssets, ThemeProvider } from '../theme';

SplashScreen.preventAutoHideAsync();

// Screens render ApiError messages inline. Anything else is a bug, so it is rethrown to
// the error boundary instead of being shown as if it were a server message.
const isBug = (error) => !(error instanceof ApiError);

const queryClient = new QueryClient({
  defaultOptions: {
    // No retries: a 4xx does not change when repeated, it only delays the error message.
    queries: { retry: false, throwOnError: isBug },
    mutations: { throwOnError: isBug },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { isPending } = useAuth();
  const ready = (fontsLoaded || fontError) && !isPending;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
