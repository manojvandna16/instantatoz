/**
 * app/(auth)/otp.tsx — OTP verification screen
 */
import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyOTP } from '../../src/services/auth.service';
import { COLORS } from '../../src/constants';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleVerify() {
    if (otp.length !== 6 || loading) return;
    const confirmation = (global as any).__otpConfirmation;
    if (!confirmation) {
      setError('Session expired. Please go back and try again.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOTP(confirmation, otp);
      // Auth state change in root layout handles redirect automatically
    } catch (err: any) {
      console.error('[OTP] Error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please resend.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify your{'\n'}number</Text>
        <Text style={styles.subtitle}>
          OTP sent to{' '}
          <Text style={styles.phone}>+91 {phone}</Text>
        </Text>

        <TextInput
          ref={inputRef}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => { setOtp(t.replace(/\D/g, '')); setError(''); }}
          placeholder="Enter 6-digit OTP"
          placeholderTextColor={COLORS.textMuted}
          autoFocus
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.btn, (otp.length !== 6 || loading) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={otp.length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          disabled={resendTimer > 0}
          style={styles.resend}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, padding: 24 },
  back: { marginBottom: 32, marginTop: 8 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 32 },
  phone: { fontWeight: '700', color: COLORS.text },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16, fontSize: 24, letterSpacing: 8, textAlign: 'center', marginBottom: 8, color: COLORS.text },
  error: { color: COLORS.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: COLORS.border },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resend: { marginTop: 20, alignItems: 'center' },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: COLORS.textMuted },
});
