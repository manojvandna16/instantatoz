import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, JOB_STATUS, COLLECTIONS } from '../../src/constants';
import { db } from '../../src/services/firebase';

export default function WorkerJobsScreen() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'COMPLETED'>('PENDING');

  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [declinedJobs, setDeclinedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!workerProfile?.uid) return;

    // Listen to pending jobs
    const unsubPending = db
      .collection(COLLECTIONS.JOBS)
      .where('status', '==', JOB_STATUS.FINDING_WORKERS)
      .where('category', '==', workerProfile.category)
      .where('workerIdAssigned', '==', '')
      .onSnapshot((snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingJobs(jobs);
      });

    // Listen to active jobs
    const activeStatuses = [
      JOB_STATUS.WORKER_ASSIGNED,
      JOB_STATUS.WORKER_ARRIVING,
      JOB_STATUS.WORKER_ARRIVED,
      JOB_STATUS.OTP_VERIFIED,
      JOB_STATUS.IN_PROGRESS,
    ];
    const unsubActive = db
      .collection(COLLECTIONS.JOBS)
      .where('workerIdAssigned', '==', workerProfile.uid)
      .where('status', 'in', activeStatuses)
      .onSnapshot((snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActiveJobs(jobs);
      });

    // Listen to completed jobs
    const unsubCompleted = db
      .collection(COLLECTIONS.JOBS)
      .where('workerIdAssigned', '==', workerProfile.uid)
      .where('status', '==', JOB_STATUS.COMPLETED)
      .onSnapshot((snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompletedJobs(jobs);
      });

    return () => {
      unsubPending();
      unsubActive();
      unsubCompleted();
    };
  }, [workerProfile]);

  const handleAccept = async (job: any) => {
    try {
      await db.collection(COLLECTIONS.JOBS).doc(job.id).update({
        status: JOB_STATUS.WORKER_ASSIGNED,
        workerIdAssigned: workerProfile?.uid,
        workerName: workerProfile?.name,
      });
      setActiveTab('ACTIVE');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDecline = (jobId: string) => {
    setDeclinedJobs(prev => new Set(prev).add(jobId));
  };

  const renderPendingJob = ({ item }: { item: any }) => {
    if (declinedJobs.has(item.id)) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.descText}>{item.description}</Text>
        <Text style={styles.addressText}>📍 {item.address}</Text>
        <Text style={styles.rateText}>₹{item.hourlyRate}/hr</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.declineBtn]} onPress={() => handleDecline(item.id)}>
            <Text style={styles.btnText}>❌ Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.acceptBtn]} onPress={() => handleAccept(item)}>
            <Text style={styles.btnText}>✅ Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderActiveJob = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
        <Text style={styles.statusText}>Status: {item.status}</Text>
        <Text style={styles.addressText}>📍 {item.address}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(worker)/active-job')}>
          <Text style={styles.navBtnText}>Manage Job</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCompletedJob = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
        <Text style={styles.descText}>Date: {item.completedAt ? new Date(item.completedAt.toDate ? item.completedAt.toDate() : item.completedAt).toLocaleDateString() : 'N/A'}</Text>
        <Text style={styles.rateText}>Total: ₹{item.totalAmount || 0}</Text>
        <Text style={styles.descText}>Duration: {item.totalMinutes || 0} mins</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Jobs</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'PENDING' && styles.activeTab]} onPress={() => setActiveTab('PENDING')}>
          <Text style={[styles.tabText, activeTab === 'PENDING' && styles.activeTabText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'ACTIVE' && styles.activeTab]} onPress={() => setActiveTab('ACTIVE')}>
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'COMPLETED' && styles.activeTab]} onPress={() => setActiveTab('COMPLETED')}>
          <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {activeTab === 'PENDING' && (
          <FlatList
            data={pendingJobs.filter(j => !declinedJobs.has(j.id))}
            renderItem={renderPendingJob}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No pending requests</Text>}
          />
        )}
        {activeTab === 'ACTIVE' && (
          <FlatList
            data={activeJobs}
            renderItem={renderActiveJob}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No active jobs</Text>}
          />
        )}
        {activeTab === 'COMPLETED' && (
          <FlatList
            data={completedJobs}
            renderItem={renderCompletedJob}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No completed jobs</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15, padding: 5 },
  backButtonText: { color: '#fff', fontSize: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2d2d4e' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.secondary },
  tabText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  activeTabText: { color: COLORS.secondary },
  listContainer: { flex: 1, padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 15 },
  customerName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  categoryText: { color: COLORS.secondary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  descText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  addressText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8 },
  rateText: { color: COLORS.success, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  statusText: { color: COLORS.warning, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  declineBtn: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  acceptBtn: { backgroundColor: COLORS.success },
  btnText: { color: '#fff', fontWeight: 'bold' },
  navBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  navBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
