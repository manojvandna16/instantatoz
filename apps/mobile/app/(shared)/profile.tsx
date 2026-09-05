/**
 * app/(shared)/profile.tsx
 * CRITICAL: The ONLY place in the app where "Become a Worker" is shown.
 * Mode switcher, account info, settings, sign out.
 */
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Linking, TextInput, Modal, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../../src/services/firebase';
import { uploadWorkerPhoto } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { useModeStore } from '../../src/store/modeStore';
import { signOut } from '../../src/services/auth.service';
import { COLORS, LEGAL_URLS, WORKER_STATUS, COLLECTIONS } from '../../src/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, workerProfile, setUserProfile, setWorkerProfile } = useAuthStore();
  const { activeMode, setMode } = useModeStore();
  const [signingOut, setSigningOut] = useState(false);
  
  // Edit Profile State
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [togglingOnline, setTogglingOnline] = useState(false);

  const initials = (userProfile?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploadingPhoto(true);
        const user = auth().currentUser;
        if (!user) throw new Error('Not authenticated');

        const publicUrl = await uploadWorkerPhoto(result.assets[0].uri, `${user.uid}_avatar.jpg`);
        
        await db.collection(COLLECTIONS.USERS).doc(user.uid).update({ photoUrl: publicUrl, updatedAt: firestore.Timestamp.now() });
        setUserProfile({ ...userProfile!, photoUrl: publicUrl });
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error: any) {
      console.log('Upload error', error);
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSaveProfile() {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName.length < 2) { Alert.alert('Invalid', 'Name must be at least 2 characters.'); return; }
    if (!newAddress) { Alert.alert('Invalid', 'Please select an address.'); return; }
    
    setSavingProfile(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');
      await db.collection(COLLECTIONS.USERS).doc(user.uid).update({ name: trimmedName, address: newAddress, updatedAt: firestore.Timestamp.now() });
      setUserProfile({ ...userProfile!, name: trimmedName, address: newAddress });
      setEditProfileVisible(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleToggleOnline() {
    if (!workerProfile) return;
    const newValue = !workerProfile.isOnline;
    setTogglingOnline(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');
      await db.collection(COLLECTIONS.WORKERS).doc(user.uid).update({ isOnline: newValue, updatedAt: firestore.Timestamp.now() });
      setWorkerProfile({ ...workerProfile, isOnline: newValue });
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setTogglingOnline(false);
    }
  }

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

    // Case C: ACTIVE — show mode switch and online toggle
    if (workerProfile.verificationStatus === WORKER_STATUS.ACTIVE) {
      return (
        <View style={{ gap: 8 }}>
          <View style={[styles.workerCard, styles.workerCardActive, { marginBottom: 0 }]}>
            <View style={styles.workerCardLeft}>
              <Text style={styles.workerCardIcon}>✅</Text>
              <View>
                <Text style={[styles.workerCardTitle, { color: COLORS.white }]}>Worker Account Active</Text>
                <Text style={[styles.workerCardId, { color: 'rgba(255,255,255,0.8)' }]}>{workerProfile.workerNumber}</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.workerCard, { paddingVertical: 12 }]}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.text }}>Available for Jobs (Online)</Text>
            {togglingOnline ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <TouchableOpacity
                style={{
                  width: 50, height: 28, borderRadius: 14,
                  backgroundColor: workerProfile.isOnline ? COLORS.success : COLORS.border,
                  justifyContent: 'center', paddingHorizontal: 2,
                  alignItems: workerProfile.isOnline ? 'flex-end' : 'flex-start'
                }}
                onPress={handleToggleOnline}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' }} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.workerCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary }]}
            onPress={handleSwitchToWorker}
            activeOpacity={0.8}
          >
            <View style={styles.workerCardLeft}>
              <Text style={styles.workerCardIcon}>🔄</Text>
              <Text style={[styles.workerCardTitle, { color: COLORS.primary }]}>Switch to Worker Mode</Text>
            </View>
            <Text style={[styles.workerCardArrow, { color: COLORS.primary }]}>›</Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap} disabled={uploadingPhoto}>
            {userProfile?.photoUrl ? (
              <Image source={{ uri: userProfile.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.editIconWrap}>
              {uploadingPhoto ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.editIconText}>📷</Text>}
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.userName}>{userProfile?.name || 'Loading...'}</Text>
              <TouchableOpacity onPress={() => { 
                setNewName(userProfile?.name || ''); 
                setNewAddress(userProfile?.address || '');
                setEditProfileVisible(true); 
              }}>
                <Text style={styles.link}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userPhone}>{userProfile?.phone || ''}</Text>
            {userProfile?.address && (
              <Text style={styles.userAddress}>📍 {userProfile.address}</Text>
            )}
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal visible={editProfileVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter your full name"
              />

              <Text style={styles.label}>Full Address</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={newAddress}
                onChangeText={setNewAddress}
                placeholder="e.g. Village, Ward, Tehsil, Pincode"
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setEditProfileVisible(false)}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnTextSave}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  avatarWrap: { position: 'relative' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  editIconWrap: { position: 'absolute', bottom: -2, right: -2, backgroundColor: COLORS.secondary, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  editIconText: { fontSize: 12 },
  userInfo: { flex: 1, paddingLeft: 6 },
  userName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  userPhone: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  userAddress: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, fontWeight: '500' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  modalInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalBtnTextCancel: { color: COLORS.textMuted, fontWeight: '600', fontSize: 15 },
  modalBtnSave: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalBtnTextSave: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
