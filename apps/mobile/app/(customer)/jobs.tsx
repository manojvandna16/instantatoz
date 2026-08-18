/**
 * app/(customer)/jobs.tsx — My Jobs (Phase 1 stub)
 * STATUS: STUB — Full job list in Phase 5
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants';

export default function JobsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💼</Text>
        <Text style={styles.emptyTitle}>No jobs yet</Text>
        <Text style={styles.emptyDesc}>Your booking history will appear here.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(customer)/search')}>
          <Text style={styles.btnText}>Find a Worker</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24, textAlign: 'center' },
  btn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
