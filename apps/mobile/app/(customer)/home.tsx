/**
 * app/(customer)/home.tsx — Customer Home screen (enhanced)
 * Shows active job banner, service categories, recent jobs
 */
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { SERVICE_CATEGORIES, COLORS, JOB_STATUS } from '../../src/constants';
import { listenCustomerJobs, Job } from '../../src/services/job.service';

const ACTIVE_STATUSES = [
  JOB_STATUS.FINDING_WORKERS, JOB_STATUS.WORKER_ASSIGNED,
  JOB_STATUS.WORKER_ARRIVING, JOB_STATUS.WORKER_ARRIVED,
  JOB_STATUS.OTP_VERIFIED, JOB_STATUS.IN_PROGRESS,
];

const STATUS_LABELS: Record<string, string> = {
  [JOB_STATUS.FINDING_WORKERS]: 'Finding Worker...',
  [JOB_STATUS.WORKER_ASSIGNED]: 'Worker Coming 🚶',
  [JOB_STATUS.WORKER_ARRIVING]: 'Worker On Way 🚶',
  [JOB_STATUS.WORKER_ARRIVED]: 'Worker Arrived — Share OTP 🔐',
  [JOB_STATUS.OTP_VERIFIED]: 'Work Started ⏱️',
  [JOB_STATUS.IN_PROGRESS]: 'Work In Progress ⏱️',
};

const HOW_IT_WORKS = [
  { step: '1', icon: '📍', title: 'Share Location', desc: 'Allow GPS or select your location' },
  { step: '2', icon: '🔍', title: 'Find Workers', desc: 'See verified workers near you' },
  { step: '3', icon: '✅', title: 'Book & Start', desc: 'Choose a worker and get the job done' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const firstName = userProfile?.name?.split(' ')[0] || '';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;
    const unsub = listenCustomerJobs(userProfile.uid, (list) => {
      setJobs(list);
      setLoadingJobs(false);
    });
    return unsub;
  }, [userProfile?.uid]);

  const activeJob = jobs.find((j) => ACTIVE_STATUSES.includes(j.status as any));
  const recentJobs = jobs.filter((j) => !ACTIVE_STATUSES.includes(j.status as any)).slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{firstName ? `Hello, ${firstName} 👋` : 'Welcome 👋'}</Text>
            <Text style={styles.subGreeting}>What do you need help with today?</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(shared)/profile')}>
            <Text style={styles.profileInitial}>{firstName.charAt(0).toUpperCase() || '?'}</Text>
          </TouchableOpacity>
        </View>

        {/* Active Job Banner */}
        {!loadingJobs && activeJob && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => router.push({ pathname: '/(customer)/job-detail', params: { jobId: activeJob.id } })}
            activeOpacity={0.85}
          >
            <View style={styles.activeBannerLeft}>
              <View style={styles.pulseDot} />
              <View>
                <Text style={styles.activeBannerTitle}>Job In Progress</Text>
                <Text style={styles.activeBannerStatus}>{STATUS_LABELS[activeJob.status] || activeJob.status}</Text>
              </View>
            </View>
            <Text style={styles.activeBannerArrow}>View →</Text>
          </TouchableOpacity>
        )}

        {/* Find a Worker CTA */}
        {!activeJob && (
          <TouchableOpacity style={styles.ctaCard} onPress={() => router.push('/(customer)/search')} activeOpacity={0.9}>
            <Text style={styles.ctaTitle}>Find a Worker Near You</Text>
            <Text style={styles.ctaSubtitle}>Verified workers • Hourly billing • OTP protected</Text>
            <View style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>Search Now →</Text>
            </View>
          </TouchableOpacity>
        )}

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

        {/* Recent Jobs */}
        {!loadingJobs && recentJobs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Jobs</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/jobs')}>
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            {recentJobs.map((j) => (
              <TouchableOpacity
                key={j.id}
                style={styles.recentJobCard}
                onPress={() => router.push({ pathname: '/(customer)/job-detail', params: { jobId: j.id } })}
              >
                <View>
                  <Text style={styles.recentCategory}>{j.category}</Text>
                  <Text style={styles.recentDesc} numberOfLines={1}>{j.description}</Text>
                </View>
                <View style={styles.recentRight}>
                  {j.totalAmount ? <Text style={styles.recentAmount}>₹{j.totalAmount.toFixed(0)}</Text> : null}
                  <Text style={[styles.recentStatus, { color: j.status === 'COMPLETED' ? COLORS.success : COLORS.danger }]}>
                    {j.status === 'COMPLETED' ? '✓ Done' : '✗ Cancelled'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {HOW_IT_WORKS.map((item) => (
            <View key={item.step} style={styles.howRow}>
              <View style={styles.stepBadge}><Text style={styles.stepText}>{item.step}</Text></View>
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
  activeBanner: { margin: 16, marginBottom: 0, backgroundColor: '#1d4ed8', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4ade80' },
  activeBannerTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  activeBannerStatus: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  activeBannerArrow: { color: '#fff', fontWeight: '700' },
  ctaCard: { margin: 16, backgroundColor: COLORS.primary, borderRadius: 20, padding: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  ctaSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
  ctaBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  section: { backgroundColor: COLORS.white, marginTop: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '22%', alignItems: 'center', marginBottom: 8 },
  catIconBg: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 11, color: COLORS.text, textAlign: 'center', fontWeight: '500', lineHeight: 14 },
  recentJobCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  recentCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  recentDesc: { fontSize: 13, color: COLORS.text },
  recentRight: { alignItems: 'flex-end' },
  recentAmount: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  recentStatus: { fontSize: 12, fontWeight: '600' },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  howIcon: { fontSize: 24, width: 32 },
  howContent: { flex: 1 },
  howTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  howDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
