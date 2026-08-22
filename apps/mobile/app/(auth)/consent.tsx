/**
 * app/(auth)/consent.tsx
 * Shown ONLY for new users — confirms legal consent and creates user profile.
 * Calls Cloud Function createUserProfile securely.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../src/services/firebase';
import { callApi } from '../../src/services/api';
import { COLORS, LEGAL_URLS, TERMS_VERSION, PRIVACY_VERSION } from '../../src/constants';

export default function ConsentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAgree() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      // Call Vercel API to create user profile
      await callApi('createUserProfile', {
        name: user.displayName || '',
        consentVersions: {
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
        },
      });

      // Root layout will detect profile and redirect to customer home
      router.replace('/(customer)/home');
    } catch (err: any) {
      console.error('[Consent] Error:', err);
      Alert.alert('Error', 'Failed to create your account. Please try again.\n' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>??</Text>
        </View>
        <Text style={styles.title}>Welcome to{'\n'}Instantatoz</Text>
        <Text style={styles.subtitle}>
          Before you continue, please review what data we collect and how we use it.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we collect</Text>
          {[
            { icon: '??', text: 'Your phone number for authentication' },
            { icon: '??', text: 'Your name and profile information' },
            { icon: '??', text: 'Your location when you search for workers nearby' },
            { icon: '??', text: 'Your job history and booking records' },
          ].map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.listIcon}>{item.icon}</Text>
              <Text style={styles.listText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your rights</Text>
          <Text style={styles.cardBody}>
            You can delete your account at any time from Profile ? Settings ? Delete Account.
            We do not sell your personal data.
          </Text>
        </View>

        <View style={styles.linksRow}>
          <TouchableOpacity onPress={() => Linking.openURL(LEGAL_URLS.terms)}>
            <Text style={styles.link}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL(LEGAL_URLS.privacy)}>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleAgree} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>I Agree & Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 24, paddingBottom: 40 },
  iconWrap: { alignItems: 'center', marginTop: 16, marginBottom: 16 },
  icon: { fontSize: 56 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  card: { backgroundColor: COLORS.background, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  cardBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  listIcon: { fontSize: 16, width: 24 },
  listText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  linksRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  link: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  dot: { color: COLORS.textMuted },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});





