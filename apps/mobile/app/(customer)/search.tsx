/**
 * app/(customer)/search.tsx — Find Worker (Phase 1 stub)
 * Full geo-matching implemented in Phase 3/4
 * STATUS: STUB — Location permission rationale shown, actual map in Phase 3
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { COLORS, SERVICE_CATEGORIES } from '../../src/constants';

export default function SearchScreen() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  async function requestLocation() {
    // Show rationale BEFORE requesting permission
    Alert.alert(
      'Location Required',
      'Instantatoz uses your location to show nearby available workers. We never share your exact location publicly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Allow Location',
          onPress: async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              setLocationGranted(true);
            } else {
              Alert.alert('Permission Denied', 'You can enable location from device Settings to find nearby workers.');
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Worker</Text>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContainer}>
        {SERVICE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text style={styles.catPillIcon}>{cat.icon}</Text>
            <Text style={[styles.catPillText, selectedCategory === cat.id && styles.catPillTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {!locationGranted ? (
          <View style={styles.locationCard}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationTitle}>Share your location</Text>
            <Text style={styles.locationDesc}>
              Allow location access to see verified workers near you.
              Your location is only used for matching — it is never shared with workers as your exact address.
            </Text>
            <TouchableOpacity style={styles.locationBtn} onPress={requestLocation}>
              <Text style={styles.locationBtnText}>Allow Location Access</Text>
            </TouchableOpacity>
            <Text style={styles.locationAlt}>
              Don't want to share GPS?{'\n'}Manual location selection coming soon.
            </Text>
          </View>
        ) : (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonIcon}>🗺️</Text>
            <Text style={styles.comingSoonTitle}>Location Access Granted!</Text>
            <Text style={styles.comingSoonDesc}>
              Live worker map is coming in the next update. Workers will appear as pins on the map near your location.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  catScroll: { maxHeight: 56, backgroundColor: COLORS.white },
  catContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.background, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catPillIcon: { fontSize: 14 },
  catPillText: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  catPillTextActive: { color: '#fff' },
  content: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  locationCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  locationIcon: { fontSize: 48, marginBottom: 12 },
  locationTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  locationDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  locationBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginBottom: 12 },
  locationBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  locationAlt: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  comingSoon: { alignItems: 'center', padding: 24 },
  comingSoonIcon: { fontSize: 64, marginBottom: 16 },
  comingSoonTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  comingSoonDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
