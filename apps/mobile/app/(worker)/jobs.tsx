import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants';
export default function WorkerJobsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <View style={styles.h}><Text style={styles.t}>Job Requests</Text></View>
      <View style={styles.e}>
        <Text style={styles.i}>📋</Text>
        <Text style={styles.et}>No requests yet</Text>
        <Text style={styles.ed}>Go Online to receive job requests from nearby customers.</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  h: { padding: 20 }, t: { fontSize: 20, fontWeight: '800', color: '#fff' },
  e: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  i: { fontSize: 64, marginBottom: 16 }, et: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  ed: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
});
