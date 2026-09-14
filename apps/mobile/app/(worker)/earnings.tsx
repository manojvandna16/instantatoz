import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants';
import { callApi } from '../../src/services/api';

export default function EarningsScreen() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);

  useEffect(() => {
    fetchWallet();
  }, [workerProfile?.uid]);

  const fetchWallet = async () => {
    if (!workerProfile?.uid) return;
    try {
      setLoading(true);
      const data = await callApi('getWorkerWallet', {});
      setWalletData(data);
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestWithdrawal = async () => {
    if (!walletData?.currentBalance || walletData.currentBalance <= 0) {
      alert('No available balance to withdraw.');
      return;
    }
    try {
      setLoading(true);
      await callApi('requestWithdrawal', { amount: walletData.currentBalance });
      alert('Withdrawal request submitted successfully!');
      fetchWallet();
    } catch (err: any) {
      alert(err.message || 'Failed to request withdrawal.');
      setLoading(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const isEarning = item.type === 'EARNING';
    const dateStr = new Date(item.date).toLocaleDateString();
    
    return (
      <View style={styles.jobCard}>
        <View style={styles.jobRow}>
          <Text style={styles.jobNum}>
            {isEarning ? (item.isLegacy ? item.jobNumber || 'Legacy Job' : `Assignment: ${item.jobId.slice(0, 8)}`) : 'Withdrawal'}
          </Text>
          <Text style={[styles.jobAmount, { color: isEarning ? COLORS.success : COLORS.danger }]}>
            {isEarning ? '+' : '-'}₹{item.amount?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <Text style={styles.jobCustomer}>{item.status}</Text>
        <View style={styles.jobRow}>
          <Text style={styles.jobDate}>{dateStr}</Text>
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
        <Text style={styles.title}>Earnings & Wallet</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBoxMain}>
              <Text style={styles.summaryLabel}>Current Balance</Text>
              <Text style={styles.summaryValueMain}>₹{walletData?.currentBalance?.toFixed(2) || '0.00'}</Text>
              
              <TouchableOpacity 
                style={[styles.withdrawBtn, (walletData?.currentBalance || 0) <= 0 && styles.withdrawBtnDisabled]}
                onPress={requestWithdrawal}
              >
                <Text style={styles.withdrawBtnText}>Withdraw</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabelSmall}>Total Earned</Text>
                <Text style={styles.summaryValueSmall}>₹{walletData?.totalEarnings?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabelSmall}>Withdrawn</Text>
                <Text style={styles.summaryValueSmall}>₹{walletData?.totalWithdrawn?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabelSmall}>Pending</Text>
                <Text style={styles.summaryValueSmall}>₹{walletData?.pendingWithdrawals?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <FlatList
              data={walletData?.history || []}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.textMuted }}>No transactions yet.</Text>}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.white, elevation: 2 },
  backButton: { marginRight: 16 },
  backButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  summaryContainer: { padding: 16 },
  summaryBoxMain: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 8 },
  summaryValueMain: { color: COLORS.white, fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  withdrawBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  withdrawBtnDisabled: { opacity: 0.5 },
  withdrawBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabelSmall: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  summaryValueSmall: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  jobCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobNum: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  jobAmount: { fontSize: 16, fontWeight: 'bold' },
  jobCustomer: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  jobDate: { fontSize: 12, color: COLORS.textMuted },
});
