/**
 * app/(customer)/_layout.tsx
 * Customer section with Bottom Tab Navigator
 */
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="post-job"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.postBtn, focused && styles.postBtnActive]}>
              <Text style={styles.postBtnText}>＋</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💼" label="My Jobs" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="job-detail"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabEmoji: { fontSize: 22, opacity: 0.45 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500' },
  tabLabelActive: { color: COLORS.primary, fontWeight: '700' },
  postBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  postBtnActive: { backgroundColor: COLORS.primary },
  postBtnText: { fontSize: 22, color: COLORS.primary, fontWeight: '700', lineHeight: 26 },
});
