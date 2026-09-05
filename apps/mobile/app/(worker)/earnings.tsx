import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, JOB_STATUS, COLLECTIONS } from '../../src/constants';
import { db } from '../../src/services/firebase';

export default function EarningsScreen() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [thisWeekEarnings, setThisWeekEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);

  useEffect(() => {
    if (!workerProfile?.uid) return;

    const unsub = db
      .collection(COLLECTIONS.JOBS)
      .where('workerIdAssigned', '==', workerProfile.uid)
      .where('status', '==', JOB_STATUS.COMPLETED)
      .onSnapshot((snapshot) => {
        const jobs: any[] = [];
        let totalE = 0;
        let weekE = 0;
        let monthE = 0;
        let totalMins = 0;

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        snapshot.docs.forEach((doc) => {
          const data = doc.data() as import('../../src/services/job.service').Job;
          const job = { id: doc.id, ...data };
          jobs.push(job);

          const amount = job.totalAmount || 0;
          totalE += amount;
          totalMins += job.totalMinutes || 0;

          if (job.completedAt) {
            const date = job.completedAt.toDate ? job.completedAt.toDate() : new Date(job.completedAt);
            if (date >= startOfWeek) weekE += amount;
            if (date >= startOfMonth) monthE += amount;
          }
        });

        // Sort descending by completion date
        jobs.sort((a, b) => {
          const d1 = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt || 0);
          const d2 = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt || 0);
          return d2.getTime() - d1.getTime();
        });

        setCompletedJobs(jobs);
        setLifetimeEarnings(totalE);
        setThisWeekEarnings(weekE);
        setThisMonthEarnings(monthE);
        setAvgDuration(jobs.length > 0 ? Math.round(totalMins / jobs.length) : 0);
      });

    return () => unsub();
  }, [workerProfile]);

  const renderJobItem = ({ item }: { item: any }) => {
    const dateStr = item.completedAt ? (item.completedAt.toDate ? item.completedAt.toDate() : new Date(item.completedAt)).toLocaleDateString() : 'N/A';
    
    return (
      <View style={styles.jobCard}>
        <View style={styles.jobRow}>
          <Text style={styles.jobNum}>{item.jobNumber || 'JOB'}</Text>
          <Text style={styles.jobAmount}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
        </View>
        <Text style={styles.jobCustomer}>{item.customerName || 'Customer'}</Text>
        <View style={styles.jobRow}>
          <Text style={styles.jobDate}>{dateStr}</Text>
          <Text style={styles.jobDuration}>{item.totalMinutes || 0} mins</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Earnings</Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.lifetimeLabel}>Lifetime Earnings</Text>
        <Text style={styles.lifetimeAmount}>₹{lifetimeEarnings.toFixed(2)}</Text>
        
        <View style={styles.periodRow}>
          <View style={styles.periodBox}>
            <Text style={styles.periodLabel}>This Week</Text>
            <Text style={styles.periodAmount}>₹{thisWeekEarnings.toFixed(2)}</Text>
          </View>
          <View style={styles.periodBox}>
            <Text style={styles.periodLabel}>This Month</Text>
            <Text style={styles.periodAmount}>₹{thisMonthEarnings.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{completedJobs.length}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>⭐ {workerProfile?.stats?.averageRating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{avgDuration}m</Text>
          <Text style={styles.statLabel}>Avg Duration</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Completed Jobs</Text>
      
      <FlatList
        data={completedJobs}
        renderItem={renderJobItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No completed jobs yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15, padding: 5 },
  backButtonText: { color: '#fff', fontSize: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  summaryContainer: { backgroundColor: 'rgba(255,255,255,0.05)', margin: 20, padding: 20, borderRadius: 16, alignItems: 'center' },
  lifetimeLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 5 },
  lifetimeAmount: { color: COLORS.success, fontSize: 40, fontWeight: 'bold', marginBottom: 20 },
  periodRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15 },
  periodBox: { flex: 1, alignItems: 'center' },
  periodLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 5 },
  periodAmount: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 10 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  jobCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, marginBottom: 10 },
  jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  jobNum: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' },
  jobAmount: { color: COLORS.success, fontSize: 16, fontWeight: 'bold' },
  jobCustomer: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  jobDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  jobDuration: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  emptyText: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20 }
});
