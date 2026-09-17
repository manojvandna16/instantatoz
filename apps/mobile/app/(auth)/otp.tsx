/**
 * app/(auth)/otp.tsx — OTP verification screen
 */
import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyOTP, sendOTP } from '../../src/services/auth.service';
import { COLORS } from '../../src/constants';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
      setError('Session expired. Please go back and request a new OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOTP(confirmation, otp);
      // Auth state change in root layout handles redirect automatically
    } catch (err: any) {
      console.error('[OTP] Error:', err.code, err.message);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please enter the correct 6-digit code.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please resend.');
      } else if (err.code === 'auth/missing-verification-code') {
        setError('Please enter the OTP you received.');
      } else {
        setError(`Verification failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0 || resending || !phone) return;
    setResending(true);
    setError('');
    setOtp('');
    try {
      const confirmation = await sendOTP('+91' + phone);
      (global as any).__otpConfirmation = confirmation;
      setResendTimer(30);
      Alert.alert('OTP Sent!', `A new OTP has been sent to +91 ${phone}.`);
    } catch (err: any) {
      console.error('[OTP Resend] Error:', err.code, err.message);
      setError(`Could not resend OTP: ${err.message || 'Please try again.'}`);
    } finally {
      setResending(false);
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
        <Text style={styles.hint}>Check your SMS inbox. It may take up to 60 seconds.</Text>

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

        {/* Resend OTP — properly resends, doesn't just go back */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendTimer > 0 || resending}
          style={styles.resend}
        >
          {resending ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </Text>
          )}
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
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 4 },
  hint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 28, fontStyle: 'italic' },
  phone: { fontWeight: '700', color: COLORS.text },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16, fontSize: 24, letterSpacing: 8, textAlign: 'center', marginBottom: 8, color: COLORS.text },
  error: { color: COLORS.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: COLORS.border },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resend: { marginTop: 20, alignItems: 'center', minHeight: 30, justifyContent: 'center' },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: COLORS.textMuted },
});
