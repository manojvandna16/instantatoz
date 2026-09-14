/**
 * app/(customer)/post-job.tsx
 * Customer posts a job publicly — workers browse and accept
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SERVICE_CATEGORIES } from '../../src/constants';
import { createJob } from '../../src/services/job.service';
import { callApi } from '../../src/services/api';
import AddressForm, { AddressData } from '../../src/components/AddressForm';

export default function PostJobScreen() {
  const router = useRouter();
  const { userProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [jobAddress, setJobAddress] = useState<AddressData>({
    country: 'India', state: 'Uttarakhand', district: '', tehsil: '', villageOrWard: '', locality: ''
  });
  const [addressStr, setAddressStr] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [requiredWorkers, setRequiredWorkers] = useState('1');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const selectedCat = SERVICE_CATEGORIES.find((c) => c.name === category);

  async function handleGetLocation() {
    setLoadingLoc(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      
      const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geocode.length > 0) {
        const g = geocode[0];
        const addrParts = [g.name, g.street, g.subregion, g.city, g.region, g.postalCode].filter(Boolean);
        setAddressStr(addrParts.join(', '));
      }
    } catch (err: any) {
      console.log('Location error:', err);
      Alert.alert('Error', 'Failed to fetch location.');
    } finally {
      setLoadingLoc(false);
    }
  }

  async function handlePost() {
    if (!userProfile) return;
    if (!description.trim()) { Alert.alert('Required', 'Please describe your requirement.'); return; }
    
    let finalAddressString = '';
    if (useProfileAddress) {
      if (!userProfile?.address || !userProfile?.addressString) {
        return Alert.alert('Incomplete Profile', 'Your profile address is incomplete. Please select "Use Another Address" or update your profile first.');
      }
      finalAddressString = userProfile.addressString;
    } else {
      if (!jobAddress.district || !jobAddress.tehsil || !jobAddress.villageOrWard) {
        return Alert.alert('Incomplete Address', 'Please provide district, tehsil, and village/ward for the job location.');
      }
      finalAddressString = `${jobAddress.locality}, ${jobAddress.villageOrWard}, ${jobAddress.tehsil}, ${jobAddress.district}, ${jobAddress.state}, ${jobAddress.country}`;
    }

    const hours = parseInt(estimatedHours, 10);
    if (isNaN(hours) || hours < 1) { Alert.alert('Required', 'Please enter valid estimated hours.'); return; }
    
    const workersCount = parseInt(requiredWorkers, 10);
    if (isNaN(workersCount) || workersCount < 1) { Alert.alert('Required', 'Please enter a valid number of workers.'); return; }

    setLoading(true);
    try {
      const hourlyRate = 150; // Hardcoded default for now, could be dynamic per category
      const totalAmount = hours * hourlyRate * workersCount;

      let orderData: any = null;

      try {
        // 1. Create order on backend for payment
        orderData = await callApi('createRazorpayOrder', { 
          jobData: {
            customerName: userProfile.name,
            category,
            description: description.trim(),
            address: finalAddressString,
            latitude: latitude || 0,
            longitude: longitude || 0,
            hourlyRate,
            estimatedHours: hours,
            requiredWorkers: workersCount,
          }
        });
      } catch (backendError: any) {
        console.warn('Backend API failed, simulating payment for testing:', backendError);
        // Fallback for local testing if the backend is not deployed
        Alert.alert(
          'Simulated Payment',
          `Backend API is not reachable (${backendError.message}). Simulating a successful payment for testing purposes.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                const jobId = await createJob({
                  customerId: userProfile.uid,
                  customerName: userProfile.name,
                  category,
                  description: description.trim(),
                  address: finalAddressString,
                  latitude: latitude || 0,
                  longitude: longitude || 0,
                  hourlyRate,
                  estimatedHours: hours,
                  requiredWorkers: workersCount,
                  paymentId: 'pay_simulated_' + Date.now()
                });
        
                Alert.alert(
                  '✅ Job Posted & Paid!',
                  'Your job request is live. Workers nearby will see it and accept shortly.',
                  [{ text: 'Track Job', onPress: () => router.replace({ pathname: '/(customer)/job-detail', params: { jobId } }) }]
                );
              }
            }
          ]
        );
        setLoading(false);
        return; // Exit here since we simulated
      }

      // 2. Open Razorpay Checkout (Only runs if backend successfully returned order_id)
      const options = {
        description: `Prepaid Booking - ${category}`,
        image: 'https://instantatoz.online/favicon.ico',
        currency: 'INR',
        key: orderData.key,
        amount: orderData.amount,
        name: 'Instantatoz Services',
        order_id: orderData.order_id,
        prefill: {
          email: userProfile?.phone ? `${userProfile.phone}@instantatoz.com` : 'customer@instantatoz.com',
          contact: userProfile?.phone || '9999999999', // Razorpay requires a valid phone
          name: userProfile?.name || 'Customer'
        },
        theme: { color: COLORS.primary }
      };

      const RazorpayModule = require('react-native-razorpay');
      const RazorpayCheckout = RazorpayModule.default || RazorpayModule;

      let paymentData;
      try {
        paymentData = await RazorpayCheckout.open(options);
      } catch (error: any) {
        console.log('[Razorpay Error]', error);
        Alert.alert('Payment Failed', `Gateway Error: ${error?.code || 'Unknown'} | ${error?.description || error?.message || JSON.stringify(error)}`);
        setLoading(false);
        return;
      }

      // 2. Verify Payment on Backend
      try {
        await callApi('verifyPayment', {
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          jobId: orderData.jobId
        });
      } catch (verifyError: any) {
        console.error('[Payment Verification Failed]', verifyError);
        Alert.alert('Payment Verification Failed', 'We could not verify your payment. If money was deducted, please contact support.');
        setLoading(false);
        return;
      }

      // 3. Payment Success -> Job is live
      Alert.alert(
        '✅ Job Posted & Paid!',
        'Your job request is live. Workers nearby will see it and accept shortly.',
        [{ text: 'Track Job', onPress: () => router.replace({ pathname: '/(customer)/job-detail', params: { jobId: orderData.jobId } }) }]
      );

    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to process request. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <Text style={styles.stepText}>Step {step}/2</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Step 1 — Category */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>What do you need help with?</Text>
            <Text style={styles.stepDesc}>Select a service category</Text>

            <View style={styles.catGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, category === cat.name && styles.catCardSelected]}
                  onPress={() => setCategory(cat.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIconBg, { backgroundColor: cat.color + '20' }, category === cat.name && { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={[styles.catName, category === cat.name && styles.catNameSelected]} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, !category && styles.btnDisabled]}
              disabled={!category}
              onPress={() => setStep(2)}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <View>
            <View style={styles.selectedCatBadge}>
              <Text style={styles.selectedCatIcon}>{selectedCat?.icon}</Text>
              <Text style={styles.selectedCatName}>{category}</Text>
            </View>

            <Text style={styles.stepTitle}>Describe your requirement</Text>
            <Text style={styles.stepDesc}>More details help workers understand and accept faster</Text>

            <Text style={styles.label}>What exactly do you need?</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Need to fix a leaking tap in the bathroom, also check kitchen sink..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              maxLength={300}
            />
            <Text style={styles.charCount}>{description.length}/300</Text>

            <Text style={styles.label}>Estimated Hours (Prepaid)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 2"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={estimatedHours}
              onChangeText={setEstimatedHours}
            />

            <Text style={styles.label}>Number of Workers Required</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 1"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={requiredWorkers}
              onChangeText={setRequiredWorkers}
            />

            <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 16 }}>
              Amount to Pay: ₹{parseInt(estimatedHours || '0') * 150 * parseInt(requiredWorkers || '1')} (₹150/hr)
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Job Location</Text>
              <TouchableOpacity onPress={handleGetLocation}>
                {loadingLoc ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.locLink}>📍 Use Current GPS Location</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.addressToggleRow}>
              <TouchableOpacity
                style={[styles.addressToggleBtn, useProfileAddress && styles.addressToggleBtnActive]}
                onPress={() => setUseProfileAddress(true)}
              >
                <Text style={[styles.addressToggleText, useProfileAddress && styles.addressToggleTextActive]}>Use My Profile Address</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addressToggleBtn, !useProfileAddress && styles.addressToggleBtnActive]}
                onPress={() => setUseProfileAddress(false)}
              >
                <Text style={[styles.addressToggleText, !useProfileAddress && styles.addressToggleTextActive]}>Use Another Address</Text>
              </TouchableOpacity>
            </View>

            {useProfileAddress ? (
              <View style={styles.profileAddressCard}>
                {userProfile?.addressString ? (
                  <Text style={{ color: '#fff' }}>{userProfile.addressString}</Text>
                ) : (
                  <Text style={{ color: COLORS.warning }}>Profile address is incomplete. Please update it in the profile section or choose "Use Another Address".</Text>
                )}
              </View>
            ) : (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 20 }}>
                <AddressForm value={jobAddress} onChange={setJobAddress} />
                
                {addressStr ? (
                  <Text style={{ color: COLORS.success, fontSize: 12, marginTop: 10 }}>GPS Captured: {addressStr}</Text>
                ) : null}
              </View>
            )}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>💡 How prepaid works</Text>
              <Text style={styles.infoItem}>1. You pay upfront for the estimated hours.</Text>
              <Text style={styles.infoItem}>2. You will get two OTPs (Start & End).</Text>
              <Text style={styles.infoItem}>3. Provide Start OTP when worker arrives.</Text>
              <Text style={styles.infoItem}>4. Provide End OTP to confirm work completion.</Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextBtn, styles.postBtn, (!description.trim() || (!useProfileAddress && (!jobAddress.district || !jobAddress.tehsil || !jobAddress.villageOrWard)) || !estimatedHours || loading) && styles.btnDisabled]}
                disabled={!description.trim() || (!useProfileAddress && (!jobAddress.district || !jobAddress.tehsil || !jobAddress.villageOrWard)) || !estimatedHours || loading}
                onPress={handlePost}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Pay & Post Job</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontWeight: '600', fontSize: 15, minWidth: 60 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  stepText: { fontSize: 13, color: COLORS.textMuted, minWidth: 60, textAlign: 'right' },
  progressBar: { height: 3, backgroundColor: COLORS.border },
  progressFill: { height: 3, backgroundColor: COLORS.primary },
  scroll: { padding: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4, marginTop: 8 },
  stepDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: { width: '30%', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  catCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  catIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 14 },
  catNameSelected: { color: COLORS.primary },
  selectedCatBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary + '10', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  selectedCatIcon: { fontSize: 18 },
  selectedCatName: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  textInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: COLORS.text, marginBottom: 4, backgroundColor: COLORS.white },
  textArea: { height: 100, textAlignVertical: 'top', marginBottom: 4 },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginBottom: 16 },
  infoCard: { backgroundColor: '#f0f9ff', borderRadius: 14, padding: 16, marginTop: 8, marginBottom: 24, borderWidth: 1, borderColor: '#bae6fd' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#0369a1', marginBottom: 8 },
  infoItem: { fontSize: 13, color: '#0369a1', marginBottom: 4, lineHeight: 18 },
  btnRow: { flexDirection: 'row', gap: 12 },
  backBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  backBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  nextBtn: { flex: 2, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  postBtn: { flex: 2 },
  btnDisabled: { opacity: 0.5 },
  addressToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  addressToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
  addressToggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: COLORS.primary },
  addressToggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  addressToggleTextActive: { color: COLORS.primary },
  profileAddressCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, marginBottom: 20 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  locLink: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
});
