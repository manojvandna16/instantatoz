/**
 * app/(customer)/_layout.tsx
 * Customer Mode bottom tab navigator
 * NO "Become a Worker" tab here — it ONLY lives in Profile > Settings
 */
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const { Text } = require('react-native');
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Find Worker',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'My Jobs',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💼" focused={focused} />,
        }}
      />
      <Tabs.Screen name="worker" options={{ href: null }} />
    </Tabs>
  );
}
