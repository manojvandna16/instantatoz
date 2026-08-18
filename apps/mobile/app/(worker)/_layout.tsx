/**
 * app/(worker)/_layout.tsx
 * Worker Mode bottom tabs — ONLY shown when user has VERIFIED worker profile
 */
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, WORKER_STATUS } from '../../src/constants';

export default function WorkerLayout() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();

  // Guard: if worker is not ACTIVE, redirect to customer
  useEffect(() => {
    if (!workerProfile || workerProfile.verificationStatus !== WORKER_STATUS.ACTIVE) {
      router.replace('/(customer)/home');
    }
  }, [workerProfile]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#2d2d4e',
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2, color: COLORS.white },
        tabBarActiveTintColor: COLORS.secondary,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => {
            const { Text } = require('react-native');
            return <Text style={{ fontSize: focused ? 24 : 20 }}>📊</Text>;
          },
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Job Requests',
          tabBarIcon: ({ focused }) => {
            const { Text } = require('react-native');
            return <Text style={{ fontSize: focused ? 24 : 20 }}>📋</Text>;
          },
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ focused }) => {
            const { Text } = require('react-native');
            return <Text style={{ fontSize: focused ? 24 : 20 }}>💰</Text>;
          },
        }}
      />
    </Tabs>
  );
}
