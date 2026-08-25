import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Linking, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, LEGAL_URLS, SERVICE_CATEGORIES } from '../../src/constants';
import { callApi } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';
import { uploadWorkerPhoto } from '../../src/services/supabase';

export default function BecomeWorkerScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');
  const [workerTerms, setWorkerTerms] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  }

  function removeSkill(sk: string) {
    setSkills(skills.filter((s) => s !== sk));
  }

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'We need access to your photos to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 || null);
    }
  }

  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!photoBase64) {
      Alert.alert('Photo Required', 'Please select a profile photo to complete registration.');
      return;
    }
    
    setLoading(true);
    setUploading(true);
    try {
      // 1. Upload photo to Supabase
      const fileName = `profile_${Date.now()}.jpg`;
      const uploadedUrl = await uploadWorkerPhoto(photoBase64, fileName);
      
      // 2. Register worker with Vercel API
      await callApi('registerWorker', {
        category,
        skills,
        hourlyRate: Number(hourlyRate),
        experience,
        profileUrl: uploadedUrl,
      });
      
      Alert.alert(
        'Registration Submitted',
        'Your worker application has been submitted for review. You will be notified once verified (usually 1-3 business days).',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Offer Services</Text>
        <Text style={styles.step}>Step {step}/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>What service do you offer?</Text>
            <View style={styles.catGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, category === cat.name && styles.catCardSelected]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={[styles.catName, category === cat.name && styles.catNameSelected]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !category && styles.btnDisabled]}
              disabled={!category}
              onPress={() => setStep(2)}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Your Skills in {category}</Text>
            <Text style={styles.sectionDesc}>Add all skills you can offer. Customers will search by skill.</Text>
            <View style={styles.skillInputRow}>
              <TextInput
                style={styles.skillInput}
                placeholder="e.g. Fan Installation, Wiring..."
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={addSkill}
              />
              <TouchableOpacity style={styles.addSkillBtn} onPress={addSkill}>
                <Text style={styles.addSkillBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.skillsWrap}>
              {skills.map((sk) => (
                <TouchableOpacity key={sk} style={styles.skillChip} onPress={() => removeSkill(sk)}>
                  <Text style={styles.skillChipText}>{sk} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
            {skills.length === 0 && <Text style={styles.skillHint}>Add at least one skill to continue</Text>}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Hourly Rate (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 200"
              keyboardType="number-pad"
              value={hourlyRate}
              onChangeText={setHourlyRate}
            />

            <TouchableOpacity
              style={[styles.nextBtn, (skills.length === 0 || !hourlyRate) && styles.btnDisabled]}
              disabled={skills.length === 0 || !hourlyRate}
              onPress={() => setStep(3)}
            >
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Upload Profile Photo</Text>
            <Text style={styles.sectionDesc}>A clear profile photo is required for customer verification.</Text>
            
            <View style={styles.photoContainer}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.placeholderText}>No photo selected</Text>
                </View>
              )}
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Text style={styles.uploadBtnText}>{photoUri ? 'Change Photo' : 'Select Photo'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📋 What happens next</Text>
              <Text style={styles.infoText}>1. Our team reviews your application</Text>
              <Text style={styles.infoText}>2. Document verification (Aadhaar required)</Text>
              <Text style={styles.infoText}>3. You get notified when verified (1-3 days)</Text>
            </View>

            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setWorkerTerms(!workerTerms)}
            >
              <View style={[styles.checkbox, workerTerms && styles.checked]}>
                {workerTerms && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                I agree to the{' '}
                <Text style={styles.link} onPress={() => Linking.openURL(LEGAL_URLS.workerTerms)}>
                  Worker Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextBtn, (!workerTerms || !photoUri || loading) && styles.btnDisabled]}
              disabled={!workerTerms || !photoUri || loading}
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextBtnText}>Submit Application</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  step: { fontSize: 13, color: COLORS.textMuted },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  sectionDesc: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catCard: { width: '47%', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  catCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catName: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  catNameSelected: { color: COLORS.primary },
  skillInputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  skillInput: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  addSkillBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  addSkillBtnText: { color: '#fff', fontWeight: '700' },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  skillChip: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
  skillChipText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  skillHint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  textInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 20 },
  nextBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { backgroundColor: COLORS.border },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  photoContainer: { alignItems: 'center', marginVertical: 20 },
  photoPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  placeholderText: { fontSize: 12, color: COLORS.textMuted },
  previewImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 14 },
  uploadBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  uploadBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  infoCard: { backgroundColor: COLORS.background, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, marginTop: 10 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  infoText: { fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: COLORS.border, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  checkLabel: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  link: { color: COLORS.primary, textDecorationLine: 'underline' },
});
