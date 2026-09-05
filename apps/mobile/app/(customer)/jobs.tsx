/**
 * app/(customer)/jobs.tsx
 * Customer's job list with real-time Firestore updates
 */
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, JOB_STATUS } from '../../src/constants';
import { listenCustomerJobs, Job, formatDuration } from '../../src/services/job.service';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
  [JOB_STATUS.CREATED]: '#3b82f6',
  [JOB_STATUS.FINDING_WORKERS]: '#8b5cf6',
  [JOB_STATUS.WORKER_ASSIGNED]: '#f59e0b',
  [JOB_STATUS.WORKER_ARRIVING]: '#f59e0b',
  [JOB_STATUS.WORKER_ARRIVED]: '#f97316',
  [JOB_STATUS.OTP_VERIFIED]: '#10b981',
  [JOB_STATUS.IN_PROGRESS]: '#10b981',
  [JOB_STATUS.COMPLETED]: '#22c55e',
  [JOB_STATUS.CANCELLED]: '#ef4444',
  [JOB_STATUS.DISPUTED]: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  [JOB_STATUS.CREATED]: 'Created',
  [JOB_STATUS.FINDING_WORKERS]: 'Finding Worker',
  [JOB_STATUS.WORKER_ASSIGNED]: 'Worker Coming',
  [JOB_STATUS.WORKER_ARRIVING]: 'Worker Coming',
  [JOB_STATUS.WORKER_ARRIVED]: 'Worker Arrived',
  [JOB_STATUS.OTP_VERIFIED]: 'Starting',
  [JOB_STATUS.IN_PROGRESS]: 'In Progress',
  [JOB_STATUS.COMPLETED]: 'Completed',
  [JOB_STATUS.CANCELLED]: 'Cancelled',
  [JOB_STATUS.DISPUTED]: 'Disputed',
};

const ACTIVE_STATUSES = [
  JOB_STATUS.FINDING_WORKERS, JOB_STATUS.WORKER_ASSIGNED,
  JOB_STATUS.WORKER_ARRIVING, JOB_STATUS.WORKER_ARRIVED,
  JOB_STATUS.OTP_VERIFIED, JOB_STATUS.IN_PROGRESS,
];

export default function JobsScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const [tab, setTab] = useState<Tab>('All');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;
    setLoading(true);
    const unsub = listenCustomerJobs(userProfile.uid, (list) => {
      setJobs(list);
      setLoading(false);
    });
    return unsub;
  }, [userProfile?.uid]);

  const filtered = jobs.filter((j) => {
    if (tab === 'Active') return ACTIVE_STATUSES.includes(j.status as any);
    if (tab === 'Completed') return j.status === JOB_STATUS.COMPLETED;
    if (tab === 'Cancelled') return j.status === JOB_STATUS.CANCELLED;
    return true;
  });

  function renderJob({ item }: { item: Job }) {
    const statusColor = STATUS_COLORS[item.status] || COLORS.textMuted;
    const isActive = ACTIVE_STATUSES.includes(item.status as any);
    const date = item.createdAt?.toDate?.();
    return (
      <TouchableOpacity
        style={[styles.jobCard, isActive && styles.jobCardActive]}
        onPress={() => router.push({ pathname: '/(customer)/job-detail', params: { jobId: item.id } })}
        activeOpacity={0.8}
      >
        <View style={styles.jobTop}>
          <View style={styles.jobNumberRow}>
            <Text style={styles.jobNumber}>{item.jobNumber}</Text>
            {isActive && <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[item.status] || item.status}</Text>
          </View>
        </View>

        <Text style={styles.jobCategory}>{item.category}</Text>
        <Text style={styles.jobDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.jobAddress} numberOfLines={1}>📍 {item.address}</Text>

        <View style={styles.jobFooter}>
          <Text style={styles.jobDate}>
            {date ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </Text>
          <View style={styles.jobRight}>
            {item.workerName && <Text style={styles.workerName}>👷 {item.workerName}</Text>}
            {item.totalAmount ? (
              <Text style={styles.jobAmount}>₹{item.totalAmount.toFixed(0)}</Text>
            ) : (
              <Text style={styles.jobRate}>₹{item.hourlyRate}/hr</Text>
            )}
          </View>
        </View>

        {item.status === JOB_STATUS.COMPLETED && item.paymentStatus === 'PENDING' && (
          <View style={styles.payBanner}>
            <Text style={styles.payBannerText}>💳 Payment Pending — Tap to Pay</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💼</Text>
          <Text style={styles.emptyTitle}>{tab === 'All' ? 'No Jobs Yet' : `No ${tab} Jobs`}</Text>
          <Text style={styles.emptyDesc}>
            {tab === 'All' ? 'Book your first worker from the Search tab.' : `You have no ${tab.toLowerCase()} jobs.`}
          </Text>
          {tab === 'All' && (
            <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(customer)/search')}>
              <Text style={styles.ctaBtnText}>Find a Worker</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(j) => j.id}
          renderItem={renderJob}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  ctaBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  ctaBtnText: { color: '#fff', fontWeight: '700' },
  jobCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, elevation: 2 },
  jobCardActive: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jobNumber: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, fontFamily: 'monospace' },
  liveBadge: { backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  jobCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  jobDesc: { fontSize: 14, color: COLORS.text, marginBottom: 6 },
  jobAddress: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobDate: { fontSize: 12, color: COLORS.textMuted },
  jobRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  workerName: { fontSize: 12, color: COLORS.textMuted },
  jobAmount: { fontSize: 15, fontWeight: '800', color: COLORS.success },
  jobRate: { fontSize: 13, color: COLORS.textMuted },
  payBanner: { marginTop: 10, backgroundColor: '#fef3c7', borderRadius: 8, padding: 8, alignItems: 'center' },
  payBannerText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
});
