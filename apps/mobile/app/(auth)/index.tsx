/**
 * app/(auth)/index.tsx — Welcome / Splash Screen
 * No "Become a Worker" here — Customer-first entry point
 */
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVICE_CATEGORIES, COLORS } from '../../src/constants';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>IA</Text>
          </View>
          <Text style={styles.appName}>Instantatoz</Text>
          <Text style={styles.tagline}>Find Help. Get Work. Instantly.</Text>
        </View>

        {/* Description */}
        <Text style={styles.desc}>
          On-demand local workforce marketplace connecting customers with verified workers nearby.
        </Text>

        {/* Category Preview */}
        <View style={styles.categoriesWrap}>
          <Text style={styles.categoriesLabel}>12+ Service Categories</Text>
          <View style={styles.categoriesGrid}>
            {SERVICE_CATEGORIES.slice(0, 6).map((cat) => (
              <View key={cat.id} style={styles.catChip}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(auth)/phone')}>
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 24, paddingBottom: 40, alignItems: 'center' },
  logoBox: { alignItems: 'center', marginTop: 32, marginBottom: 24 },
  logoIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  appName: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  desc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 8 },
  categoriesWrap: { width: '100%', marginBottom: 32 },
  categoriesLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12, textAlign: 'center' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.background, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  catIcon: { fontSize: 14 },
  catName: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  btn: { width: '100%', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footer: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
});
