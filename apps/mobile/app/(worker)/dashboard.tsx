/**
 * app/(worker)/dashboard.tsx
 * Worker Home — Live Pending Jobs & Online Toggle
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../src/store/authStore';
import { auth, db } from '../../src/services/firebase';
import { listenPendingJobs, acceptJob, Job } from '../../src/services/job.service';
import { COLORS, COLLECTIONS } from '../../src/constants';

export default function WorkerDashboard() {
  const router = useRouter();
  const { workerProfile, setWorkerProfile } = useAuthStore();
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [acceptingJob, setAcceptingJob] = useState<string | null>(null);

  useEffect(() => {
    if (!workerProfile?.category || !workerProfile.isOnline) {
      setPendingJobs([]);
      return;
    }
    const unsubscribe = listenPendingJobs(workerProfile.category, (jobs) => {
      setPendingJobs(jobs);
    });
    return () => unsubscribe();
  }, [workerProfile?.category, workerProfile?.isOnline]);

  async function handleToggleOnline() {
    if (!workerProfile) return;
    const newValue = !workerProfile.isOnline;
    setLoadingToggle(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');
      await db.collection(COLLECTIONS.WORKERS).doc(user.uid).update({ isOnline: newValue, updatedAt: firestore.Timestamp.now() });
      setWorkerProfile({ ...workerProfile, isOnline: newValue });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoadingToggle(false);
    }
  }

  async function handleAcceptJob(job: Job) {
    if (!workerProfile) return;
    setAcceptingJob(job.id);
    try {
      await acceptJob(job.id, workerProfile.uid, workerProfile.name);
      router.replace({ pathname: '/(worker)/active-job', params: { jobId: job.id } });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept job. Another worker might have accepted it.');
    } finally {
      setAcceptingJob(null);
    }
  }

  if (!workerProfile) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {workerProfile.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{workerProfile.category}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/(shared)/profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{workerProfile.name[0]}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Online Toggle */}
        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{workerProfile.isOnline ? 'You are Online' : 'You are Offline'}</Text>
            <Text style={styles.toggleDesc}>
              {workerProfile.isOnline ? 'Waiting for new job requests...' : 'Go online to receive jobs'}
            </Text>
          </View>
          {loadingToggle ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <TouchableOpacity
              style={[styles.switch, workerProfile.isOnline && styles.switchOn]}
              onPress={handleToggleOnline}
            >
              <View style={[styles.switchKnob, workerProfile.isOnline && styles.switchKnobOn]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={styles.statValue}>₹0</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Jobs Done</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        {/* Pending Jobs */}
        <Text style={styles.sectionTitle}>New Requests</Text>
        
        {!workerProfile.isOnline ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>😴</Text>
            <Text style={styles.emptyTitle}>You're Offline</Text>
            <Text style={styles.emptyDesc}>Toggle online to start receiving job requests from nearby customers.</Text>
          </View>
        ) : pendingJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>Searching for jobs...</Text>
            <Text style={styles.emptyDesc}>Keep this app open. New job requests will appear here automatically.</Text>
          </View>
        ) : (
          pendingJobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobCustomer}>{job.customerName}</Text>
                <Text style={styles.jobRate}>₹{job.hourlyRate}/hr</Text>
              </View>
              <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
              <Text style={styles.jobAddress}>📍 {job.address}</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.declineBtn}>
                  <Text style={styles.declineText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptJob(job)}
                  disabled={acceptingJob === job.id}
                >
                  {acceptingJob === job.id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.acceptText}>Accept Job</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1f2937' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#fff' },
  badge: { backgroundColor: COLORS.primary + '30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  badgeText: { color: COLORS.primaryLight, fontSize: 11, fontWeight: '700' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  toggleCard: { backgroundColor: '#1f2937', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#374151' },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  toggleDesc: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  switch: { width: 56, height: 32, borderRadius: 16, backgroundColor: '#4b5563', justifyContent: 'center', paddingHorizontal: 4 },
  switchOn: { backgroundColor: COLORS.success },
  switchKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  switchKnobOn: { alignSelf: 'flex-end' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#1f2937', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#374151' },
  statLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#1f2937', borderRadius: 16, borderWidth: 1, borderColor: '#374151', borderStyle: 'dashed' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
  jobCard: { backgroundColor: '#1f2937', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobCustomer: { fontSize: 16, fontWeight: '700', color: '#fff' },
  jobRate: { fontSize: 15, fontWeight: '700', color: COLORS.success },
  jobDesc: { fontSize: 14, color: '#d1d5db', marginBottom: 12, lineHeight: 20 },
  jobAddress: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  declineBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#374151', alignItems: 'center' },
  declineText: { color: '#d1d5db', fontWeight: '600', fontSize: 14 },
  acceptBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
