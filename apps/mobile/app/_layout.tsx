/**
 * app/_layout.tsx
 * Root layout — auth guard and mode router
 *
 * Fix: Stack navigator now always mounts on first render (never conditionally
 * hidden). Navigation logic runs in a separate NavigationGuard component that
 * is a sibling of <Stack>, so the root navigator is always ready before any
 * router.replace() call. This prevents the "Attempted to navigate before
 * mounting the Root Layout component" error.
 *
 * Flow:
 * - Not auth checked yet → show loading screen (overlay)
 * - Not authenticated → redirect to (auth)/
 * - Authenticated, no user profile → redirect to (auth)/consent
 * - Authenticated, has profile → redirect to (customer)/home
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/hooks/useAuth';
import { LoadingScreen } from '../src/components/ui/LoadingScreen';

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from 'expo-router';

// Keep splash visible while auth state loads
SplashScreen.preventAutoHideAsync();

/**
 * NavigationGuard runs as a sibling to <Stack> so the root navigator is
 * always mounted before navigation is attempted.
 */
function NavigationGuard() {
  const { uid, userProfile, isAuthChecked, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isAuthChecked) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (!uid) {
      if (!inAuthGroup) {
        router.replace('/(auth)/');
      }
    } else if (!userProfile) {
      const segs = segments as string[];
      if (segs[0] !== '(auth)' || segs[1] !== 'consent') {
        router.replace('/(auth)/consent');
      }
    } else {
      if (inAuthGroup) {
        if (userProfile.activeMode === 'worker') {
          router.replace('/(worker)/dashboard');
        } else {
          router.replace('/(customer)/home');
        }
      }
    }
  }, [uid, userProfile, isAuthChecked, segments]);

  // Render a full-screen loading overlay while checking auth
  if (!isAuthChecked || isLoading) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <LoadingScreen />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      {/* Stack always mounts first — required by Expo Router */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(worker)" />
        <Stack.Screen name="(shared)" />
      </Stack>
      {/* Auth guard runs after the navigator is mounted */}
      <NavigationGuard />
    </GestureHandlerRootView>
  );
}
