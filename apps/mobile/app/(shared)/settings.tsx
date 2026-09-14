import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import { auth, db } from '../../src/services/firebase';
import { COLORS, COLLECTIONS } from '../../src/constants';

export default function SharedSettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(true);
  const [location, setLocation] = React.useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      db.collection(COLLECTIONS.USERS).doc(user.uid).get().then(snap => {
        if (snap.exists) {
          const data = snap.data();
          if (data?.settings?.notifications !== undefined) {
            setNotifications(data.settings.notifications);
          }
        }
      });
    }
  }, []);

  const toggleNotifications = async (val: boolean) => {
    setNotifications(val);
    const user = auth().currentUser;
    if (user) {
      try {
        await db.collection(COLLECTIONS.USERS).doc(user.uid).set({
          settings: { notifications: val }
        }, { merge: true });
      } catch (err) {
        Alert.alert('Error', 'Failed to save settings');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Push Notifications</Text>
          <Switch value={notifications} onValueChange={toggleNotifications} />
        </View>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Location Services</Text>
          <Switch value={location} onValueChange={setLocation} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.dangerRow} onPress={() => router.push('/(shared)/delete-account' as any)}>
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  back: { color: COLORS.primary, fontWeight: '600', fontSize: 15, minWidth: 60 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 16, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { fontSize: 16, color: COLORS.text },
  dangerRow: { paddingVertical: 12 },
  dangerText: { fontSize: 16, color: COLORS.danger, fontWeight: '600' }
});
