/**
 * app/(worker)/dashboard.tsx
 * Worker Dashboard — GO ONLINE / GO OFFLINE toggle
 * PHASE 1: UI structure complete. Live GPS wired in Phase 3.
 */
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useModeStore } from '../../src/store/modeStore';
import { COLORS, WORKER_STATUS } from '../../src/constants';

export default function WorkerDashboard() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();
  const { setMode } = useModeStore();
  const isOnline = workerProfile?.isOnline || false;

  function switchToCustomer() {
    setMode('customer');
    router.replace('/(customer)/home');
  }

  function handleGoOnline() {
    // Phase 1: Show info message — full GPS implementation in Phase 3
    Alert.alert(
      'Go Online',
      'When you tap Go Online, Instantatoz will use your live GPS location to match you with nearby customers.\n\nFull live matching will be enabled in the next update.',
      [{ text: 'OK' }]
    );
  }

  if (!workerProfile || workerProfile.verificationStatus !== WORKER_STATUS.ACTIVE) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.noAccessIcon}>⏳</Text>
          <Text style={styles.noAccessTitle}>Verification Required</Text>
          <Text style={styles.noAccessDesc}>Worker mode is available after Admin verification.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={switchToCustomer}>
            <Text style={styles.backBtnText}>Back to Customer Mode</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1a1a2e' }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Worker Dashboard</Text>
          <Text style={styles.headerWrkId}>{workerProfile.workerNumber}</Text>
        </View>
        <TouchableOpacity style={styles.switchBtn} onPress={switchToCustomer}>
          <Text style={styles.switchBtnText}>👤 Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Online Status */}
      <View style={styles.statusCard}>
        <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.statusText}>{isOnline ? 'You are ONLINE' : 'You are OFFLINE'}</Text>
      </View>

      {/* GO ONLINE / GO OFFLINE Toggle */}
      <View style={styles.toggleWrap}>
        <TouchableOpacity
          style={[styles.toggleBtn, isOnline ? styles.goOfflineBtn : styles.goOnlineBtn]}
          onPress={handleGoOnline}
          activeOpacity={0.85}
        >
          <Text style={styles.toggleBtnText}>{isOnline ? '🔴  GO OFFLINE' : '🟢  GO ONLINE'}</Text>
          <Text style={styles.toggleBtnSub}>
            {isOnline ? 'Stop receiving job requests' : 'Start receiving job requests'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.locationNote}>
          📍 Your live GPS location will be used for job matching when Online
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Today\'s Earnings', value: '₹0', icon: '💰' },
          { label: 'Jobs Today', value: '0', icon: '💼' },
          { label: 'Rating', value: workerProfile.stats.averageRating > 0 ? workerProfile.stats.averageRating.toFixed(1) : '—', icon: '⭐' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.skillsCard}>
        <Text style={styles.skillsTitle}>{workerProfile.category}</Text>
        <View style={styles.skillsRow}>
          {workerProfile.skills.slice(0, 4).map((skill: string) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {workerProfile.skills.length > 4 && (
            <View style={styles.skillChip}>
              <Text style={styles.skillText}>+{workerProfile.skills.length - 4} more</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noAccessIcon: { fontSize: 64, marginBottom: 16 },
  noAccessTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  noAccessDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: 24 },
  backBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerWrkId: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', marginTop: 2 },
  switchBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  switchBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotOnline: { backgroundColor: COLORS.success },
  dotOffline: { backgroundColor: COLORS.textMuted },
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  toggleWrap: { marginHorizontal: 20, marginBottom: 20 },
  toggleBtn: { borderRadius: 18, paddingVertical: 24, alignItems: 'center', marginBottom: 10 },
  goOnlineBtn: { backgroundColor: COLORS.secondary },
  goOfflineBtn: { backgroundColor: COLORS.danger },
  toggleBtnText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  toggleBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  locationNote: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 2 },
  skillsCard: { backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20, borderRadius: 14, padding: 16 },
  skillsTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  skillText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
});
