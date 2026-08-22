/**
 * app/(auth)/phone.tsx — Phone number entry with mandatory legal consent
 * Both T&C and Privacy Policy checkboxes MUST be ticked before OTP can be sent
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOTP } from '../../src/services/auth.service';
import { COLORS, LEGAL_URLS, TERMS_VERSION, PRIVACY_VERSION } from '../../src/constants';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidPhone = /^[6-9]\d{9}$/.test(phone);
  const canSubmit = isValidPhone && termsChecked && privacyChecked && !loading;

  async function handleSendOTP() {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const confirmation = await sendOTP('+91' + phone);
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone,
          termsVersion: TERMS_VERSION,
          privacyVersion: PRIVACY_VERSION,
          confirmationResultKey: 'temp', // handled via global store in real impl
        },
      });
      // Store confirmation result globally so OTP screen can access it
      (global as any).__otpConfirmation = confirmation;
    } catch (err: any) {
      console.error('[Phone] OTP send error:', err);
      setError('Failed to send OTP. Please check your number and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Enter your{'\n'}phone number</Text>
        <Text style={styles.subtitle}>We will send a verification code</Text>

        {/* Phone Input */}
        <View style={styles.phoneRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
            autoFocus
          />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}

        {/* Legal Consent — MANDATORY, unchecked by default */}
        <View style={styles.consentBox}>
          <TouchableOpacity style={styles.checkRow} onPress={() => setTermsChecked(!termsChecked)} activeOpacity={0.7}>
            <View style={[styles.checkbox, termsChecked && styles.checked]}>
              {termsChecked && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.consentText}>
              I agree to the{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(LEGAL_URLS.terms)}>
                Terms & Conditions
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkRow} onPress={() => setPrivacyChecked(!privacyChecked)} activeOpacity={0.7}>
            <View style={[styles.checkbox, privacyChecked && styles.checked]}>
              {privacyChecked && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.consentText}>
              I agree to the{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(LEGAL_URLS.privacy)}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btn, !canSubmit && styles.btnDisabled]}
          onPress={handleSendOTP}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Standard SMS charges may apply. OTP valid for 60 seconds.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 32 },
  phoneRow: { flexDirection: 'row', marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden' },
  prefix: { paddingHorizontal: 14, paddingVertical: 14, backgroundColor: COLORS.background, borderRightWidth: 1, borderRightColor: COLORS.border, justifyContent: 'center' },
  prefixText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 18, letterSpacing: 1 },
  error: { color: COLORS.danger, fontSize: 13, marginBottom: 8 },
  consentBox: { marginVertical: 20, gap: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: COLORS.border, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  consentText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  link: { color: COLORS.primary, textDecorationLine: 'underline', fontWeight: '600' },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: COLORS.border },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  note: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});

