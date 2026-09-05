/**
 * app/(worker)/_layout.tsx
 * Worker section with Bottom Tab Navigator
 */
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function WorkerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="jobs" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Jobs" focused={focused} /> }} />
      <Tabs.Screen name="earnings" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Earnings" focused={focused} /> }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }} />
      <Tabs.Screen name="active-job" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#1a1a2e', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', height: 64, paddingBottom: 8, paddingTop: 8, elevation: 8 },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabEmoji: { fontSize: 22, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },
});
