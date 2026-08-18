import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>IA</Text>
      </View>
      <Text style={styles.appName}>Instantatoz</Text>
      <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  appName: { fontSize: 22, fontWeight: '800', color: COLORS.text },
});
