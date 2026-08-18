/**
 * app/_layout.tsx
 * Root layout — auth guard and mode router
 * 
 * Flow:
 * - Not auth checked yet → show loading screen
 * - Not authenticated → redirect to (auth)/
 * - Authenticated, no user profile → redirect to (auth)/consent
 * - Authenticated, has profile → redirect to (customer)/ (ALWAYS customer first)
 */
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/hooks/useAuth';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { uid, userProfile, isAuthChecked, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isAuthChecked) return;

    SplashScreen.hideAsync();

    const inAuth = segments[0] === '(auth)';

    if (!uid) {
      // Not logged in → send to auth
      if (!inAuth) router.replace('/(auth)/');
    } else if (!userProfile) {
      // Logged in but no profile → new user, needs consent
      router.replace('/(auth)/consent');
    } else {
      // Authenticated with profile → customer home (always default)
      if (inAuth) router.replace('/(customer)/home');
    }
  }, [uid, userProfile, isAuthChecked]);

  if (!isAuthChecked || isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(worker)" />
          <Stack.Screen name="(shared)" />
        </Stack>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}
