/**
 * app/(customer)/home.tsx — Customer Home screen
 * Shows service categories and find-worker CTA
 * NO "Become a Worker" button here
 */
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { SERVICE_CATEGORIES, COLORS } from '../../src/constants';

const HOW_IT_WORKS = [
  { step: '1', icon: '📍', title: 'Share Location', desc: 'Allow GPS or select your location' },
  { step: '2', icon: '🔍', title: 'Find Workers', desc: 'See verified workers near you' },
  { step: '3', icon: '✅', title: 'Book & Start', desc: 'Choose a worker and get the job done' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const firstName = userProfile?.name?.split(' ')[0] || '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {firstName ? `Hello, ${firstName} 👋` : 'Welcome 👋'}
            </Text>
            <Text style={styles.subGreeting}>What do you need help with today?</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(shared)/profile')}>
            <Text style={styles.profileInitial}>
              {firstName.charAt(0).toUpperCase() || '?'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Find a Worker CTA */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaTitle}>Find a Worker Near You</Text>
          <Text style={styles.ctaSubtitle}>Verified workers • Live location matching</Text>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Search Now →</Text>
          </View>
        </TouchableOpacity>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.grid}>
            {SERVICE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => router.push({ pathname: '/(customer)/search', params: { category: cat.id } })}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconBg, { backgroundColor: cat.color + '20' }]}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {HOW_IT_WORKS.map((item) => (
            <View key={item.step} style={styles.howRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>{item.step}</Text>
              </View>
              <Text style={styles.howIcon}>{item.icon}</Text>
              <View style={styles.howContent}>
                <Text style={styles.howTitle}>{item.title}</Text>
                <Text style={styles.howDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12, backgroundColor: COLORS.white },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subGreeting: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { color: '#fff', fontSize: 18, fontWeight: '700' },
  ctaCard: { margin: 16, backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  ctaSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
  ctaBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  section: { backgroundColor: COLORS.white, marginTop: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '22%', alignItems: 'center', marginBottom: 8 },
  catIconBg: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 11, color: COLORS.text, textAlign: 'center', fontWeight: '500', lineHeight: 14 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  howIcon: { fontSize: 24, width: 32 },
  howContent: { flex: 1 },
  howTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  howDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
