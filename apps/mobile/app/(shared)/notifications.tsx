import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { listenNotifications, AppNotification, markNotificationAsRead } from '../../src/services/notifications.service';
import { COLORS } from '../../src/constants';

export default function NotificationsScreen() {
  const router = useRouter();
  const { userProfile, workerProfile } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const uid = userProfile?.uid || workerProfile?.uid;
    const userType = workerProfile ? 'worker' : 'customer';

    if (!uid) {
      setLoading(false);
      return;
    }

    const unsub = listenNotifications(
      uid, 
      userType, 
      (notifs) => {
        setNotifications(notifs);
        setErrorMsg(null);
        setLoading(false);
      },
      (err) => {
        setErrorMsg(err.message || 'Failed to load notifications');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userProfile?.uid, workerProfile?.uid]);

  const handleNotificationPress = async (notif: AppNotification) => {
    // Only personal notifications can be marked as read based on our firestore rules.
    // Broadcast notifications (ALL_USERS, FILTERED:*) are read-only to clients.
    if (!notif.read && notif.userId !== 'ALL_USERS' && !notif.userId.startsWith('FILTERED:')) {
      await markNotificationAsRead(notif.id);
    }

    // Optionally handle navigation based on notif.data
    // if (notif.data?.link) Linking.openURL(notif.data.link);
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    // Check if it's considered unread. For broadcast we don't have personal read state, so we might just not show a blue dot.
    const isBroadcast = item.userId === 'ALL_USERS' || item.userId.startsWith('FILTERED:');
    const isUnread = !item.read && !isBroadcast;

    return (
      <TouchableOpacity
        style={[styles.notifCard, isUnread && styles.notifCardUnread]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notifHeader}>
          <Text style={styles.notifTitle} numberOfLines={2}>{item.title}</Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody}>{item.body}</Text>
        <Text style={styles.notifTime}>
          {item.createdAt
            ? (item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleString('en-IN')
                : new Date(item.createdAt).toLocaleString('en-IN'))
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {router.canGoBack() && (
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.danger || '#ef4444'} />
          <Text style={[styles.emptyText, { color: COLORS.danger || '#ef4444', textAlign: 'center', paddingHorizontal: 20 }]}>
            {errorMsg}
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12 },
  listContainer: { padding: 16, paddingBottom: 40 },
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifCardUnread: {
    backgroundColor: COLORS.primary + '0A',
    borderColor: COLORS.primary + '30',
  },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  notifTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, paddingRight: 8 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4 },
  notifBody: { fontSize: 14, color: COLORS.text, marginBottom: 12, lineHeight: 20 },
  notifTime: { fontSize: 12, color: COLORS.textMuted },
});
