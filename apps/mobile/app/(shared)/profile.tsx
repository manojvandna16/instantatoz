/**
 * app/(shared)/profile.tsx
 * CRITICAL: The ONLY place in the app where "Become a Worker" is shown.
 * Mode switcher, account info, settings, sign out.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useModeStore } from '../../src/store/modeStore';
import { signOut } from '../../src/services/auth.service';
import { COLORS, LEGAL_URLS, WORKER_STATUS } from '../../src/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, workerProfile } = useAuthStore();
  const { activeMode, setMode } = useModeStore();
  const [signingOut, setSigningOut] = useState(false);

  const firstName = userProfile?.name?.split(' ')[0] || 'User';
  const initials = (userProfile?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  function handleSwitchToWorker() {
    if (workerProfile?.verificationStatus === WORKER_STATUS.ACTIVE) {
      setMode('worker');
      router.replace('/(worker)/dashboard');
    }
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch {
            setSigningOut(false);
          }
        },
      },
    ]);
  }

  function renderWorkerSection() {
    // Case A: No worker profile — show upgrade option (ONLY entry point)
    if (!workerProfile || !userProfile?.hasWorkerProfile) {
      return (
        <TouchableOpacity
          style={styles.workerCard}
          onPress={() => router.push('/(shared)/become-worker')}
          activeOpacity={0.8}
        >
          <View style={styles.workerCardLeft}>
            <Text style={styles.workerCardIcon}>👷</Text>
            <View>
              <Text style={styles.workerCardTitle}>Offer Services as a Worker</Text>
              <Text style={styles.workerCardDesc}>Earn by providing your skills to nearby customers</Text>
            </View>
          </View>
          <Text style={styles.workerCardArrow}>›</Text>
        </TouchableOpacity>
      );
    }

    // Case B: PENDING or UNDER_REVIEW
    if (workerProfile.verificationStatus === WORKER_STATUS.PENDING ||
        workerProfile.verificationStatus === WORKER_STATUS.UNDER_REVIEW) {
      return (
        <TouchableOpacity
          style={[styles.workerCard, styles.workerCardPending]}
          onPress={() => router.push('/(shared)/worker-status')}
        >
          <View style={styles.workerCardLeft}>
            <Text style={styles.workerCardIcon}>⏳</Text>
            <View>
              <Text style={styles.workerCardTitle}>Verification In Progress</Text>
              <Text style={styles.workerCardId}>{workerProfile.workerNumber}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{workerProfile.verificationStatus}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.workerCardArrow}>›</Text>
        </TouchableOpacity>
      );
    }

    // Case C: ACTIVE — show mode switch
    if (workerProfile.verificationStatus === WORKER_STATUS.ACTIVE) {
      return (
        <TouchableOpacity
          style={[styles.workerCard, styles.workerCardActive]}
          onPress={handleSwitchToWorker}
          activeOpacity={0.8}
        >
          <View style={styles.workerCardLeft}>
            <Text style={styles.workerCardIcon}>✅</Text>
            <View>
              <Text style={[styles.workerCardTitle, { color: COLORS.white }]}>Switch to Worker Mode</Text>
              <Text style={[styles.workerCardId, { color: 'rgba(255,255,255,0.8)' }]}>{workerProfile.workerNumber}</Text>
            </View>
          </View>
          <Text style={[styles.workerCardArrow, { color: COLORS.white }]}>›</Text>
        </TouchableOpacity>
      );
    }

    // Case D: REJECTED
    if (workerProfile.verificationStatus === WORKER_STATUS.REJECTED) {
      return (
        <View style={[styles.workerCard, styles.workerCardRejected]}>
          <Text style={styles.workerCardIcon}>❌</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.workerCardTitle}>Application Rejected</Text>
            {workerProfile.adminNotes && (
              <Text style={styles.workerCardDesc}>{workerProfile.adminNotes}</Text>
            )}
            <TouchableOpacity onPress={() => Linking.openURL(LEGAL_URLS.support)}>
              <Text style={[styles.link, { marginTop: 6 }]}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {workerProfile?.verificationStatus === WORKER_STATUS.ACTIVE && activeMode === 'worker' && (
          <TouchableOpacity onPress={() => { setMode('customer'); router.replace('/(customer)/home'); }}>
            <Text style={styles.modeSwitchLink}>← Customer Mode</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile?.name || 'Loading...'}</Text>
            <Text style={styles.userPhone}>{userProfile?.phone || ''}</Text>
            {userProfile?.userNumber && (
              <Text style={styles.userId}>{userProfile.userNumber}</Text>
            )}
          </View>
        </View>

        {/* Worker Section — ONLY here */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Worker Services</Text>
          {renderWorkerSection()}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account & Settings</Text>
          {[
            { icon: '🔔', label: 'Notifications', onPress: () => router.push('/(shared)/settings') },
            { icon: '📍', label: 'Location Settings', onPress: () => router.push('/(shared)/settings') },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuRow} onPress={item.onPress}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Legal & Policies</Text>
          {[
            { label: 'Terms & Conditions', url: LEGAL_URLS.terms },
            { label: 'Privacy Policy', url: LEGAL_URLS.privacy },
            { label: 'Cancellation Policy', url: LEGAL_URLS.cancellation },
            { label: 'Refund Policy', url: LEGAL_URLS.refund },
            { label: 'Grievance Redressal', url: LEGAL_URLS.grievance },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuRow} onPress={() => Linking.openURL(item.url)}>
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(shared)/delete-account')}>
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={[styles.menuLabel, { color: COLORS.danger }]}>Delete Account</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow} onPress={handleSignOut} disabled={signingOut}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuLabel, { color: COLORS.danger }]}>
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.appVersion}>Instantatoz v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  modeSwitchLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  userCard: { backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14, marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  userPhone: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  userId: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  section: { backgroundColor: COLORS.white, marginBottom: 12, paddingTop: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, paddingHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  workerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 12, padding: 16, backgroundColor: COLORS.background, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border },
  workerCardActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  workerCardPending: { borderColor: COLORS.warning },
  workerCardRejected: { borderColor: COLORS.danger },
  workerCardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  workerCardIcon: { fontSize: 28 },
  workerCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  workerCardDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, lineHeight: 16 },
  workerCardId: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 2 },
  workerCardArrow: { fontSize: 24, color: COLORS.textMuted, fontWeight: '300' },
  statusBadge: { backgroundColor: COLORS.warning + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 10, color: COLORS.warning, fontWeight: '700' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  menuIcon: { fontSize: 18, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  menuArrow: { fontSize: 20, color: COLORS.textMuted },
  link: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  appVersion: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, padding: 20 },
});
