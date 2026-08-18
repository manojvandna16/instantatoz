import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/constants';

export default function WorkerStatusScreen() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();
  const status = workerProfile?.verificationStatus || 'PENDING';
  const statusConfig: Record<string, { icon: string; title: string; desc: string; color: string }> = {
    PENDING: { icon: '⏳', title: 'Under Review', desc: 'Our team has received your application and is reviewing it. This typically takes 1-3 business days.', color: COLORS.warning },
    UNDER_REVIEW: { icon: '🔍', title: 'Being Reviewed', desc: 'Our team is actively reviewing your documents and application. We will notify you soon.', color: COLORS.primary },
    REJECTED: { icon: '❌', title: 'Application Rejected', desc: workerProfile?.adminNotes || 'Please contact support for more information.', color: COLORS.danger },
  };
  const config = statusConfig[status] || statusConfig['PENDING'];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Worker Status</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.statusTitle, { color: config.color }]}>{config.title}</Text>
        <Text style={styles.wrkId}>{workerProfile?.workerNumber}</Text>
        <Text style={styles.desc}>{config.desc}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 72, marginBottom: 16 },
  statusTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  wrkId: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'monospace', marginBottom: 16 },
  desc: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
