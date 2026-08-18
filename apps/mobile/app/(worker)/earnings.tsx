import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function EarningsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <View style={styles.h}><Text style={styles.t}>Earnings</Text></View>
      <View style={styles.e}>
        <Text style={styles.i}>💰</Text>
        <Text style={styles.et}>₹0</Text>
        <Text style={styles.ed}>Complete jobs to see your earnings here.</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  h: { padding: 20 }, t: { fontSize: 20, fontWeight: '800', color: '#fff' },
  e: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  i: { fontSize: 64, marginBottom: 16 }, et: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 8 },
  ed: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
});
