import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, JOB_STATUS, COLLECTIONS } from '../../src/constants';
import { db } from '../../src/services/firebase';

export default function ActiveJobScreen() {
  const router = useRouter();
  const { workerProfile } = useAuthStore();
  const [activeJob, setActiveJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!workerProfile?.uid) return;

    const unsub = db
      .collection(COLLECTIONS.JOBS)
      .where('workerIdAssigned', '==', workerProfile.uid)
      .where('status', 'in', [
        JOB_STATUS.WORKER_ASSIGNED,
        JOB_STATUS.WORKER_ARRIVING,
        JOB_STATUS.WORKER_ARRIVED,
        JOB_STATUS.OTP_VERIFIED,
        JOB_STATUS.IN_PROGRESS,
        JOB_STATUS.COMPLETED
      ])
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          // Sort or find the most relevant. Here we just take the first.
          const doc = snapshot.docs[0];
          setActiveJob({ id: doc.id, ...doc.data() });
        } else {
          setActiveJob(null);
        }
        setLoading(false);
      });

    return () => unsub();
  }, [workerProfile]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJob?.status === JOB_STATUS.IN_PROGRESS && activeJob?.startedAt) {
      interval = setInterval(() => {
        const start = activeJob.startedAt.toDate ? activeJob.startedAt.toDate() : new Date(activeJob.startedAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsedTime(diffInSeconds > 0 ? diffInSeconds : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  const handleArrived = async () => {
    try {
      await db.collection(COLLECTIONS.JOBS).doc(activeJob.id).update({
        status: JOB_STATUS.WORKER_ARRIVED,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpInput.length !== 4) {
      Alert.alert('Error', 'Please enter a 4-digit OTP');
      return;
    }
    if (otpInput !== activeJob.otp?.toString()) {
      Alert.alert('Error', 'Wrong OTP, ask customer');
      return;
    }
    try {
      await db.collection(COLLECTIONS.JOBS).doc(activeJob.id).update({
        status: JOB_STATUS.IN_PROGRESS,
        startedAt: new Date(),
      });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const [endOtpInput, setEndOtpInput] = useState('');

  const handleEndJob = async () => {
    if (endOtpInput.length !== 4) {
      Alert.alert('Required', 'Please enter the 4-digit End OTP from the customer.');
      return;
    }
    
    Alert.alert('Confirm', 'Are you sure you want to end this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Job',
        style: 'destructive',
        onPress: async () => {
          try {
            // Import endJob locally or statically
            const { endJob } = require('../../src/services/job.service');
            await endJob(activeJob.id, endOtpInput);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.text}>Loading active job...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeJob) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Active Job</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.text}>No active job found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentEarning = ((elapsedTime / 3600) * (activeJob.hourlyRate || 0)).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Job</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.customerName}>{activeJob.customerName || 'Customer'}</Text>
          <Text style={styles.infoText}>Address: {activeJob.address}</Text>
          <Text style={styles.infoText}>Rate: ₹{activeJob.hourlyRate}/hr</Text>
          <Text style={styles.statusText}>Status: {activeJob.status}</Text>
        </View>

        {(activeJob.status === JOB_STATUS.WORKER_ASSIGNED || activeJob.status === JOB_STATUS.WORKER_ARRIVING) && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleArrived}>
            <Text style={styles.actionBtnText}>I Have Arrived</Text>
          </TouchableOpacity>
        )}

        {activeJob.status === JOB_STATUS.WORKER_ARRIVED && (
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter OTP from Customer</Text>
            <TextInput
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={4}
              value={otpInput}
              onChangeText={setOtpInput}
              placeholder="0000"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />
            <TouchableOpacity style={styles.actionBtn} onPress={handleVerifyOTP}>
              <Text style={styles.actionBtnText}>Verify OTP & Start Work</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeJob.status === JOB_STATUS.IN_PROGRESS && (
          <View style={styles.progressContainer}>
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            
            <View style={{ width: '100%', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 }}>
              <Text style={styles.otpLabel}>Enter End OTP</Text>
              <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={4}
                value={endOtpInput}
                onChangeText={setEndOtpInput}
                placeholder="0000"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn, { marginTop: 16 }]} onPress={handleEndJob}>
                <Text style={styles.actionBtnText}>Submit & End Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeJob.status === JOB_STATUS.COMPLETED && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>Job Completed!</Text>
            <Text style={styles.infoText}>Duration: {activeJob.totalMinutes} mins</Text>
            <Text style={styles.infoText}>Total Earned: ₹{activeJob.totalAmount?.toFixed(2)}</Text>
            
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push(`/(shared)/rating?jobId=${activeJob.id}&ratedRole=customer`)}
            >
              <Text style={styles.actionBtnText}>Rate Customer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15, padding: 5 },
  backButtonText: { color: '#fff', fontSize: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 12, marginBottom: 20 },
  customerName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  infoText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 5 },
  statusText: { color: COLORS.warning, fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  actionBtn: { backgroundColor: COLORS.secondary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  dangerBtn: { backgroundColor: COLORS.danger },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  otpContainer: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 12 },
  otpLabel: { color: '#fff', fontSize: 16, marginBottom: 10, textAlign: 'center' },
  otpInput: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 32, textAlign: 'center', padding: 15, borderRadius: 12, letterSpacing: 10 },
  progressContainer: { alignItems: 'center', marginTop: 20 },
  timerText: { color: '#fff', fontSize: 48, fontWeight: 'bold', fontFamily: 'monospace' },
  earningText: { color: COLORS.success, fontSize: 24, fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
  completedContainer: { backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 20, borderRadius: 12, alignItems: 'center' },
  completedTitle: { color: COLORS.success, fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
