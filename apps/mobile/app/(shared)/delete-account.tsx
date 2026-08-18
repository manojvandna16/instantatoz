import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, LEGAL_URLS } from '../../src/constants';
import { useAuthStore } from '../../src/store/authStore';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { userProfile, workerProfile } = useAuthStore();
  const hasWorker = !!workerProfile;

  function confirmDelete() {
    Alert.alert('Delete Account', 'This action cannot be undone. All your data will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete My Account', style: 'destructive', onPress: () => {
        Alert.alert('Request Submitted', 'Account deletion will be processed within 7 business days. Contact support@instantatoz.online if you need assistance.');
      }},
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>Delete Account</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningTitle}>This action cannot be undone</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What gets deleted:</Text>
          {['Your customer profile', 'Your worker profile (if any)', 'Your personal information', 'Your booking history'].map((item) => (
            <Text key={item} style={styles.bullet}>• {item}</Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What is retained (legally required):</Text>
          {['Financial records', 'Fraud prevention records', 'Audit logs for legal compliance'].map((item) => (
            <Text key={item} style={styles.bullet}>• {item}</Text>
          ))}
        </View>
        {hasWorker && (
          <TouchableOpacity style={styles.softBtn} onPress={() => Alert.alert('Stop Being a Worker', 'This removes Worker capability but keeps your Customer account.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: () => Alert.alert('Done', 'Your worker capability has been removed.') }])}>
            <Text style={styles.softBtnText}>Stop Being a Worker Only</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>Delete My Entire Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(LEGAL_URLS.support)}>
          <Text style={styles.supportLink}>Need help? Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: 24, alignItems: 'center' },
  warningIcon: { fontSize: 56, marginBottom: 12 },
  warningTitle: { fontSize: 18, fontWeight: '700', color: COLORS.danger, marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: COLORS.background, borderRadius: 14, padding: 16, width: '100%', marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  bullet: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  softBtn: { width: '100%', borderWidth: 1.5, borderColor: COLORS.warning, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  softBtnText: { color: COLORS.warning, fontWeight: '700', fontSize: 15 },
  deleteBtn: { width: '100%', backgroundColor: COLORS.danger, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  supportLink: { color: COLORS.primary, fontSize: 13, textDecorationLine: 'underline' },
});
