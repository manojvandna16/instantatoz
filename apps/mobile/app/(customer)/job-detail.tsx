/**
 * app/(customer)/job-detail.tsx
 * Full job lifecycle screen for the customer
 * Shows OTP, live timer, payment, rating etc.
 */
import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import { COLORS, JOB_STATUS } from '../../src/constants';
import { listenJob, cancelJob, markJobPaid, rateJob, Job, formatDuration, formatTimer } from '../../src/services/job.service';
import { useAuthStore } from '../../src/store/authStore';

export default function JobDetailScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const unsub = listenJob(jobId, (j) => {
      setJob(j);
      setLoading(false);
    });
    return unsub;
  }, [jobId]);

  // Live timer for IN_PROGRESS jobs
  useEffect(() => {
    if (job?.status === JOB_STATUS.IN_PROGRESS && job.startedAt) {
      const startMs = job.startedAt.toMillis();
      const tick = () => setTimerSeconds(Math.floor((Date.now() - startMs) / 1000));
      tick();
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [job?.status, job?.startedAt]);

  async function handleCancel() {
    Alert.alert('Cancel Job', 'Are you sure you want to cancel this job?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try { await cancelJob(jobId!, 'Cancelled by customer'); }
          catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  }

  // handlePay is removed since we moved to prepaid model

  async function handleSubmitRating() {
    if (rating === 0) { Alert.alert('Error', 'Please select a rating.'); return; }
    setSubmittingRating(true);
    try {
      await rateJob({ jobId: jobId!, rating, review, ratedBy: 'customer' });
      Alert.alert('⭐ Thank You!', 'Your rating has been submitted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmittingRating(false);
    }
  }

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
    </SafeAreaView>
  );

  if (!job) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}><Text style={styles.errorText}>Job not found.</Text></View>
    </SafeAreaView>
  );

  const liveEarning = job.status === JOB_STATUS.IN_PROGRESS
    ? Math.ceil((timerSeconds / 3600) * job.hourlyRate * 100) / 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Job Detail</Text>
          <Text style={styles.headerSub}>{job.jobNumber}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Category</Text>
          <Text style={styles.cardValue}>{job.category}</Text>
          <Text style={styles.cardLabel}>Description</Text>
          <Text style={styles.cardValue}>{job.description}</Text>
          <Text style={styles.cardLabel}>Address</Text>
          <Text style={styles.cardValue}>📍 {job.address}</Text>
          <Text style={styles.cardLabel}>Rate</Text>
          <Text style={styles.cardValue}>₹{job.hourlyRate}/hr</Text>
        </View>

        {/* FINDING WORKERS */}
        {(job.status === JOB_STATUS.CREATED || job.status === JOB_STATUS.FINDING_WORKERS) && (
          <View style={styles.statusCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.statusTitle}>Finding Workers Near You...</Text>
            <Text style={styles.statusDesc}>We're matching you with available workers. This usually takes 1-3 minutes.</Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleCancel}>
              <Text style={styles.dangerBtnText}>Cancel Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WORKER ASSIGNED / ARRIVING */}
        {(job.status === JOB_STATUS.WORKER_ASSIGNED || job.status === JOB_STATUS.WORKER_ARRIVING) && (
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>🚶</Text>
            <Text style={styles.statusTitle}>Worker is On The Way!</Text>
            {job.workerName && <Text style={styles.statusDesc}>👷 {job.workerName} is heading to your location.</Text>}
            <Text style={styles.statusDesc}>The worker will ring when they arrive.</Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleCancel}>
              <Text style={styles.dangerBtnText}>Cancel Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WORKER ARRIVED — show OTP */}
        {job.status === JOB_STATUS.WORKER_ARRIVED && (
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>🔐 Work Start OTP</Text>
            <Text style={styles.otpDesc}>Share this OTP with the worker to begin work</Text>
            <View style={styles.otpDisplay}>
              {(job.otp || '----').split('').map((digit, i) => (
                <View key={i} style={styles.otpBox}><Text style={styles.otpDigit}>{digit}</Text></View>
              ))}
            </View>
            <Text style={styles.otpWarning}>⚠️ Never share this OTP before the worker physically arrives.</Text>
          </View>
        )}

        {/* IN PROGRESS — live timer and End OTP */}
        {job.status === JOB_STATUS.IN_PROGRESS && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>⏱️ Work In Progress</Text>
            <Text style={styles.timerDisplay}>{formatTimer(timerSeconds)}</Text>
            {job.workerName && <Text style={styles.timerWorker}>👷 {job.workerName} is working</Text>}
            
            <View style={{ marginTop: 24, padding: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#fff', marginBottom: 8, fontWeight: '700' }}>Share to End Job</Text>
              <Text style={{ fontSize: 32, letterSpacing: 8, fontWeight: '900', color: '#fff' }}>{job.endOtp}</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' }}>Provide this END OTP to the worker only when the work is fully completed.</Text>
            </View>
          </View>
        )}

        {/* COMPLETED */}
        {job.status === JOB_STATUS.COMPLETED && (
          <>
            <View style={styles.completedCard}>
              <Text style={styles.completedIcon}>✅</Text>
              <Text style={styles.completedTitle}>Job Completed!</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{job.estimatedHours || 0} hrs</Text>
                  <Text style={styles.summaryLabel}>Billed</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>₹{(job.totalAmount || 0).toFixed(0)}</Text>
                  <Text style={styles.summaryLabel}>Total Bill</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                    Paid ✓
                  </Text>
                  <Text style={styles.summaryLabel}>Platform</Text>
                </View>
              </View>
            </View>

            {/* Rating section */}
            {!job.customerRating && (
              <View style={styles.ratingCard}>
                <Text style={styles.ratingTitle}>Rate Your Worker</Text>
                {job.workerName && <Text style={styles.ratingWorker}>👷 {job.workerName}</Text>}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setRating(s)}>
                      <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write a review (optional)"
                  value={review}
                  onChangeText={setReview}
                  multiline
                />
                <TouchableOpacity style={styles.ratingSubmitBtn} onPress={handleSubmitRating} disabled={submittingRating}>
                  {submittingRating ? <ActivityIndicator color="#fff" /> : <Text style={styles.ratingSubmitText}>Submit Rating</Text>}
                </TouchableOpacity>
              </View>
            )}

            {job.customerRating && (
              <View style={styles.ratedCard}>
                <Text style={styles.ratedText}>⭐ You rated this job {job.customerRating}/5. Thank you!</Text>
              </View>
            )}
          </>
        )}

        {/* CANCELLED */}
        {job.status === JOB_STATUS.CANCELLED && (
          <View style={styles.cancelledCard}>
            <Text style={styles.cancelledIcon}>❌</Text>
            <Text style={styles.cancelledTitle}>Job Cancelled</Text>
            {job.cancelReason && <Text style={styles.cancelledReason}>{job.cancelReason}</Text>}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.textMuted, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: COLORS.text },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  headerSub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', fontFamily: 'monospace' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, gap: 4 },
  cardLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: 8 },
  cardValue: { fontSize: 14, color: COLORS.text },
  statusCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  statusIcon: { fontSize: 48, marginBottom: 4 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  statusDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  dangerBtn: { marginTop: 8, borderWidth: 1, borderColor: COLORS.danger, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  dangerBtnText: { color: COLORS.danger, fontWeight: '600' },
  otpCard: { backgroundColor: '#1d4ed8', borderRadius: 20, padding: 24, alignItems: 'center' },
  otpLabel: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  otpDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20, textAlign: 'center' },
  otpDisplay: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  otpBox: { width: 56, height: 64, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  otpDigit: { fontSize: 32, fontWeight: '900', color: '#1d4ed8' },
  otpWarning: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  timerCard: { backgroundColor: '#064e3b', borderRadius: 20, padding: 24, alignItems: 'center' },
  timerLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  timerDisplay: { fontSize: 56, fontWeight: '900', color: '#fff', fontFamily: 'monospace' },
  timerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  timerAmount: { fontSize: 32, fontWeight: '800', color: '#34d399' },
  timerWorker: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  completedCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center' },
  completedIcon: { fontSize: 48, marginBottom: 8 },
  completedTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 20 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border },
  payBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ratingCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  ratingTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  ratingWorker: { fontSize: 13, color: COLORS.textMuted, marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  star: { fontSize: 36, color: '#d1d5db' },
  starActive: { color: '#f59e0b' },
  reviewInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text, marginBottom: 12, minHeight: 60, textAlignVertical: 'top' },
  ratingSubmitBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  ratingSubmitText: { color: '#fff', fontWeight: '700' },
  ratedCard: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14 },
  ratedText: { color: '#166534', fontWeight: '600', textAlign: 'center' },
  cancelledCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  cancelledIcon: { fontSize: 48 },
  cancelledTitle: { fontSize: 18, fontWeight: '700', color: COLORS.danger },
  cancelledReason: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
