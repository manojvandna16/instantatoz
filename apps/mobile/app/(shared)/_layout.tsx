/**
 * app/(shared)/_layout.tsx
 * Shared screens accessible from both customer and worker mode
 */
import { Stack } from 'expo-router';

export default function SharedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="become-worker" />
      <Stack.Screen name="worker-status" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="rating" />
    </Stack>
  );
}
