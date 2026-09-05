/**
 * app/(customer)/search.tsx
 * Find a Worker — shows online workers from Firestore, book a job
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  FlatList, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useRouter, useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SERVICE_CATEGORIES, COLLECTIONS } from '../../src/constants';
import { createJob } from '../../src/services/job.service';

interface OnlineWorker {
  uid: string;
  name: string;
  category: string;
  skills: string[];
  hourlyRate: number;
  stats: { averageRating: number; ratingCount: number; completedJobs: number };
  distance?: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={{ fontSize: 11, color: s <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</Text>
      ))}
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { userProfile } = useAuthStore();

  const [locationGranted, setLocationGranted] = useState(false);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category || null);
  const [workers, setWorkers] = useState<OnlineWorker[]>([]);
  const [loading, setLoading] = useState(false);

  // Booking modal
  const [bookingWorker, setBookingWorker] = useState<OnlineWorker | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [booking, setBooking] = useState(false);

  async function requestLocation() {
    Alert.alert(
      'Location Required',
      'Instantatoz uses your location to show nearby available workers. Your exact location is never shared publicly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Allow',
          onPress: async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              setMyLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
              setLocationGranted(true);
              // Auto-fill address
              try {
                const [geo] = await Location.reverseGeocodeAsync(loc.coords);
                if (geo) setAddress(`${geo.street || ''}, ${geo.city || ''}`);
              } catch { }
            } else {
              Alert.alert('Permission Denied', 'Enable location from device Settings to find nearby workers.');
            }
          },
        },
      ]
    );
  }

  // Fetch online workers
  useEffect(() => {
    if (!locationGranted) return;
    setLoading(true);
    let query = firestore().collection(COLLECTIONS.WORKERS).where('isOnline', '==', true);
    if (selectedCategory) query = query.where('category', '==', selectedCategory) as any;

    const unsub = query.onSnapshot((snap) => {
      const list: OnlineWorker[] = snap.docs.map((doc) => {
        const d = doc.data();
        // Fake distance calculation
        const dist = myLocation
          ? Math.round(Math.random() * 4 + 0.5)
          : undefined;
        return {
          uid: doc.id,
          name: d.name || 'Worker',
          category: d.category || '',
          skills: d.skills || [],
          hourlyRate: d.hourlyRate || 100,
          stats: d.stats || { averageRating: 0, ratingCount: 0, completedJobs: 0 },
          distance: dist,
        };
      });
      setWorkers(list);
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [locationGranted, selectedCategory]);

  async function handleBook() {
    if (!bookingWorker) return;
    if (!description.trim()) { Alert.alert('Error', 'Please describe the work needed.'); return; }
    if (!address.trim()) { Alert.alert('Error', 'Please enter your address.'); return; }
    if (!userProfile) { Alert.alert('Error', 'Not logged in.'); return; }

    setBooking(true);
    try {
      const jobId = await createJob({
        customerId: userProfile.uid,
        customerName: userProfile.name,
        category: bookingWorker.category,
        description: description.trim(),
        address: address.trim(),
        latitude: myLocation?.latitude ?? 28.6139,
        longitude: myLocation?.longitude ?? 77.2090,
        hourlyRate: bookingWorker.hourlyRate,
        estimatedHours: 1,
        paymentId: '',
      });
      setBookingWorker(null);
      setDescription('');
      router.push({ pathname: '/(customer)/job-detail', params: { jobId } });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create job. Try again.');
    } finally {
      setBooking(false);
    }
  }

  function renderWorker({ item }: { item: OnlineWorker }) {
    return (
      <View style={styles.workerCard}>
        <View style={styles.workerAvatarWrap}>
          <Text style={styles.workerAvatar}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.name}</Text>
          <Text style={styles.workerCategory}>{item.category}</Text>
          <View style={styles.workerMeta}>
            <StarRating rating={item.stats.averageRating} />
            <Text style={styles.workerMetaText}>
              {item.stats.averageRating > 0 ? ` ${item.stats.averageRating.toFixed(1)}` : ' New'}
              {' · '}{item.stats.completedJobs} jobs
            </Text>
          </View>
          {item.skills.slice(0, 2).length > 0 && (
            <View style={styles.skillsRow}>
              {item.skills.slice(0, 2).map((s) => (
                <View key={s} style={styles.skillChip}><Text style={styles.skillText}>{s}</Text></View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.workerRight}>
          <Text style={styles.workerRate}>₹{item.hourlyRate}</Text>
          <Text style={styles.workerRateLabel}>/hr</Text>
          {item.distance && <Text style={styles.workerDist}>{item.distance} km</Text>}
          <TouchableOpacity style={styles.bookBtn} onPress={() => setBookingWorker(item)}>
            <Text style={styles.bookBtnText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Worker</Text>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContainer}>
        <TouchableOpacity
          style={[styles.catPill, !selectedCategory && styles.catPillActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.catPillText, !selectedCategory && styles.catPillTextActive]}>All</Text>
        </TouchableOpacity>
        {SERVICE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text style={styles.catPillIcon}>{cat.icon}</Text>
            <Text style={[styles.catPillText, selectedCategory === cat.id && styles.catPillTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!locationGranted ? (
        <View style={styles.locationWrap}>
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationTitle}>Share Your Location</Text>
            <Text style={styles.locationDesc}>
              Allow location access to see verified workers near you. Your location is used only for matching.
            </Text>
            <TouchableOpacity style={styles.locationBtn} onPress={requestLocation}>
              <Text style={styles.locationBtnText}>Allow Location Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding workers near you...</Text>
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>😔</Text>
          <Text style={styles.emptyTitle}>No Workers Online</Text>
          <Text style={styles.emptyDesc}>
            {selectedCategory ? `No ${selectedCategory} workers available right now.` : 'No workers are currently online. Please try again later.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(w) => w.uid}
          renderItem={renderWorker}
          contentContainerStyle={{ padding: 12, gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Booking Modal */}
      <Modal visible={!!bookingWorker} animationType="slide" transparent onRequestClose={() => setBookingWorker(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Book {bookingWorker?.name}</Text>
            <Text style={styles.modalSub}>{bookingWorker?.category} · ₹{bookingWorker?.hourlyRate}/hr</Text>

            <Text style={styles.inputLabel}>Describe the Work*</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Fix leaking pipe in bathroom"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Your Address*</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full address"
              value={address}
              onChangeText={setAddress}
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={handleBook} disabled={booking}>
              {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setBookingWorker(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  catScroll: { maxHeight: 52, backgroundColor: COLORS.white },
  catContainer: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.background, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catPillIcon: { fontSize: 13 },
  catPillText: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  catPillTextActive: { color: '#fff' },
  locationWrap: { flex: 1, padding: 24, justifyContent: 'center' },
  locationCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 28, alignItems: 'center', elevation: 4 },
  locationIcon: { fontSize: 52, marginBottom: 12 },
  locationTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  locationDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  locationBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  locationBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: COLORS.textMuted, fontSize: 14 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  workerCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, elevation: 2 },
  workerAvatarWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  workerAvatar: { color: '#fff', fontSize: 20, fontWeight: '700' },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  workerCategory: { fontSize: 12, color: COLORS.textMuted, marginTop: 1, marginBottom: 4 },
  workerMeta: { flexDirection: 'row', alignItems: 'center' },
  workerMetaText: { fontSize: 11, color: COLORS.textMuted },
  skillsRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  skillChip: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  skillText: { fontSize: 10, color: COLORS.primary },
  workerRight: { alignItems: 'center', justifyContent: 'space-between' },
  workerRate: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  workerRateLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: -4 },
  workerDist: { fontSize: 11, color: COLORS.textMuted },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginTop: 4 },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  textInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, marginBottom: 16, backgroundColor: COLORS.background },
  confirmBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 14 },
});
