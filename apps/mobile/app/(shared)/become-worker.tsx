/**
 * app/(shared)/become-worker.tsx
 * Worker registration — writes directly to Firestore (no Supabase/Vercel needed)
 */
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, Linking, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from '../../src/services/firebase';
import { COLORS, LEGAL_URLS, SERVICE_CATEGORIES, COLLECTIONS, WORKER_STATUS } from '../../src/constants';
import { useAuthStore } from '../../src/store/authStore';

function generateWorkerNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = 'WRK-';
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

export default function BecomeWorkerScreen() {
  const router = useRouter();
  const { userProfile, setWorkerProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [resumeText, setResumeText] = useState('');
  const [workerTerms, setWorkerTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 10) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  }

  function removeSkill(sk: string) {
    setSkills(skills.filter((s) => s !== sk));
  }

  async function handleSubmit() {
    if (!workerTerms) {
      Alert.alert('Required', 'Please agree to Worker Terms & Conditions.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Required', 'Name, Phone and Address are required.');
      return;
    }

    setLoading(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      const workerData = {
        uid: user.uid,
        workerNumber: generateWorkerNumber(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        category,
        skills,
        hourlyRate: Number(hourlyRate),
        experience: experience.trim(),
        resumeText: resumeText.trim(),
        verificationStatus: WORKER_STATUS.PENDING,
        isOnline: false,
        stats: {
          completedJobs: 0,
          averageRating: 0,
          ratingCount: 0,
          totalEarnings: 0,
        },
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now(),
      };

      // Write to Firestore directly
      await db.collection(COLLECTIONS.WORKERS).doc(user.uid).set(workerData, { merge: true });
      await db.collection(COLLECTIONS.USERS).doc(user.uid).update({
        hasWorkerProfile: true,
        updatedAt: firestore.Timestamp.now(),
      });

      // Update local store
      setWorkerProfile({
        ...workerData,
        createdAt: undefined,
        updatedAt: undefined,
      } as any);

      Alert.alert(
        '🎉 Application Submitted!',
        'Aapko call or mail ke madhyam se interview ke liye bulaya jayega. Jab hamare dwara aapka interview ho jayega tab hi admin aapki ID activate karega.\n\nKripya interview mein jaruri documents (jaise Resume, Education documents, Aadhaar Card, PAN card etc) sath layein.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('[BecomeWorker]', err);
      Alert.alert('Error', err.message || 'Failed to submit. Please try again.');
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
        <Text style={styles.headerTitle}>Become a Worker</Text>
        <Text style={styles.stepIndicator}>Step {step}/3</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ——— Step 1: Category ——— */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>What service do you offer?</Text>
            <Text style={styles.stepDesc}>Select your primary skill category</Text>
            <View style={styles.catGrid}>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catCard, category === cat.name && styles.catCardSelected]}
                  onPress={() => setCategory(cat.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIconBg, { backgroundColor: cat.color + '25' }]}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={[styles.catName, category === cat.name && styles.catNameSelected]} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.btn, !category && styles.btnDisabled]}
              disabled={!category}
              onPress={() => setStep(2)}
            >
              <Text style={styles.btnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ——— Step 2: Details & Rate ——— */}
        {step === 2 && (
          <View>
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>{SERVICE_CATEGORIES.find(c => c.name === category)?.icon} {category}</Text>
            </View>
            <Text style={styles.stepTitle}>Your Details</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.textInput} placeholder="Enter full name" value={name} onChangeText={setName} />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput style={styles.textInput} placeholder="Mobile Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

            <Text style={styles.label}>Email ID (Optional)</Text>
            <TextInput style={styles.textInput} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

            <Text style={styles.label}>Address</Text>
            <TextInput style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]} placeholder="Full Address" multiline value={address} onChangeText={setAddress} />

            <Text style={[styles.label, { marginTop: 8 }]}>Skills (add up to 10)</Text>
            <View style={styles.skillRow}>
              <TextInput
                style={styles.skillInput}
                placeholder="e.g. AC Repair, Wiring..."
                placeholderTextColor={COLORS.textMuted}
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsWrap}>
              {skills.map((sk) => (
                <TouchableOpacity key={sk} style={styles.chip} onPress={() => removeSkill(sk)}>
                  <Text style={styles.chipText}>{sk} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
            {skills.length === 0 && <Text style={styles.hint}>Add at least 1 skill to continue</Text>}

            <Text style={[styles.label, { marginTop: 16 }]}>Hourly Rate (₹)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 200"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={hourlyRate}
              onChangeText={setHourlyRate}
            />

            <Text style={styles.label}>Experience</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 3 years as an electrician"
              placeholderTextColor={COLORS.textMuted}
              value={experience}
              onChangeText={setExperience}
            />

            <Text style={styles.label}>Resume / About Yourself</Text>
            <TextInput
              style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Paste your resume details or tell us about yourself..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={resumeText}
              onChangeText={setResumeText}
              maxLength={500}
            />

            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => setStep(1)}>
                <Text style={styles.outlineBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnFlex, (skills.length === 0 || !hourlyRate || !name || !phone || !address) && styles.btnDisabled]}
                disabled={skills.length === 0 || !hourlyRate || !name || !phone || !address}
                onPress={() => setStep(3)}
              >
                <Text style={styles.btnText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ——— Step 3: Review & Submit ——— */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Review & Submit</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Category</Text>
              <Text style={styles.reviewValue}>{category}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Skills</Text>
              <Text style={styles.reviewValue}>{skills.join(', ')}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Hourly Rate</Text>
              <Text style={styles.reviewValue}>₹{hourlyRate}/hour</Text>
            </View>
            {experience ? (
              <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>Experience</Text>
                <Text style={styles.reviewValue}>{experience}</Text>
              </View>
            ) : null}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>📋 What happens next</Text>
              <Text style={styles.infoItem}>1. Our team reviews your application</Text>
              <Text style={styles.infoItem}>2. Aadhaar / ID verification (via support)</Text>
              <Text style={styles.infoItem}>3. Activated within 1-3 business days</Text>
              <Text style={styles.infoItem}>4. You start receiving job requests!</Text>
            </View>

            <TouchableOpacity style={styles.termsRow} onPress={() => setWorkerTerms(!workerTerms)}>
              <View style={[styles.checkbox, workerTerms && styles.checked]}>
                {workerTerms && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.link} onPress={() => Linking.openURL(LEGAL_URLS.workerTerms)}>
                  Worker Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => setStep(2)}>
                <Text style={styles.outlineBtnText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnFlex, (!workerTerms || loading) && styles.btnDisabled]}
                disabled={!workerTerms || loading}
                onPress={handleSubmit}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Application</Text>}
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
  stepIndicator: { fontSize: 13, color: COLORS.textMuted, minWidth: 60, textAlign: 'right' },
  progressBar: { height: 3, backgroundColor: COLORS.border },
  progressFill: { height: 3, backgroundColor: COLORS.primary },
  scroll: { padding: 20, paddingBottom: 48 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4, marginTop: 8 },
  stepDesc: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  catCard: { width: '30%', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border },
  catCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  catIconBg: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 14 },
  catNameSelected: { color: COLORS.primary },
  selectedBadge: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  selectedBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  skillRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  skillInput: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  chip: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary },
  chipText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  textInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text, marginBottom: 16 },
  rowBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnFlex: { flex: 2 },
  btnDisabled: { backgroundColor: COLORS.border },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  outlineBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  reviewCard: { backgroundColor: COLORS.background, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  reviewLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 4 },
  reviewValue: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  infoBox: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16, marginVertical: 16, borderWidth: 1, borderColor: '#86efac' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#166534', marginBottom: 8 },
  infoItem: { fontSize: 13, color: '#166534', marginBottom: 4, lineHeight: 18 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: COLORS.border, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  termsText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  link: { color: COLORS.primary, textDecorationLine: 'underline' },
});
