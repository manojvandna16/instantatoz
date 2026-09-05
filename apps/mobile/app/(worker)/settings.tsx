/**
 * app/(worker)/settings.tsx
 * Worker Settings
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from '../../src/services/firebase';
import { useAuthStore } from '../../src/store/authStore';
import { COLLECTIONS, COLORS } from '../../src/constants';

export default function WorkerSettingsScreen() {
  const router = useRouter();
  const { workerProfile, setWorkerProfile } = useAuthStore();
  
  const [hourlyRate, setHourlyRate] = useState(workerProfile?.hourlyRate?.toString() || '');
  const [bio, setBio] = useState(workerProfile?.bio || '');
  const [skills, setSkills] = useState<string[]>(workerProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  }

  function removeSkill(sk: string) {
    setSkills(skills.filter(s => s !== sk));
  }

  async function handleSave() {
    if (!workerProfile) return;
    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const updates = {
        hourlyRate: Number(hourlyRate),
        bio: bio.trim(),
        skills,
        updatedAt: firestore.Timestamp.now(),
      };

      await db.collection(COLLECTIONS.WORKERS).doc(user.uid).update(updates);
      setWorkerProfile({ ...workerProfile, ...updates });
      Alert.alert('✅ Saved', 'Worker profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  if (!workerProfile) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoName}>{workerProfile.name}</Text>
          <Text style={styles.infoId}>{workerProfile.workerNumber}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{workerProfile.verificationStatus}</Text>
          </View>
        </View>

        <Text style={styles.label}>Hourly Rate (₹)</Text>
        <TextInput
          style={styles.input}
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="numeric"
          placeholder="e.g. 150"
        />

        <Text style={styles.label}>About Me (Bio)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Write something about your experience..."
          maxLength={200}
        />

        <Text style={styles.label}>Skills</Text>
        <View style={styles.skillRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={skillInput}
            onChangeText={setSkillInput}
            placeholder="Add a skill..."
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipsWrap}>
          {skills.map(sk => (
            <TouchableOpacity key={sk} style={styles.chip} onPress={() => removeSkill(sk)}>
              <Text style={styles.chipText}>{sk} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Performance Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Jobs Completed</Text>
            <Text style={styles.statValue}>{workerProfile.stats?.completedJobs || 0}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Rating</Text>
            <Text style={styles.statValue}>⭐ {workerProfile.stats?.averageRating?.toFixed(1) || '0.0'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statValue}>₹{workerProfile.stats?.totalEarnings || 0}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontWeight: '600', fontSize: 15, minWidth: 60 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, paddingBottom: 40 },
  infoCard: { backgroundColor: COLORS.background, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  infoName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  infoId: { fontSize: 13, color: COLORS.textMuted, fontFamily: 'monospace', marginTop: 4 },
  badge: { backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 10 },
  badgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text, marginBottom: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  skillRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 24 },
  chip: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
  chipText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 32 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statsCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  statsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  statLabel: { fontSize: 14, color: COLORS.textMuted },
  statValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});
