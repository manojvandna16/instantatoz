/**
 * src/hooks/useAuth.ts
 * Subscribes to Firebase auth state and loads user + worker profiles from Firestore.
 * This is the central auth hook — used in root _layout.tsx
 */
import { useEffect } from 'react';
import { onAuthStateChanged } from '../services/auth.service';
import { auth } from '../services/firebase';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { COLLECTIONS } from '../constants';

export function useAuth() {
  const {
    uid, userProfile, workerProfile, isLoading, isAuthChecked,
    setUid, setUserProfile, setWorkerProfile, setLoading, setAuthChecked, clearAll,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        // Not logged in
        clearAll();
        return;
      }

      setLoading(true);
      setUid(firebaseUser.uid);

      try {
        // Load user profile and worker profile in parallel
        const [userSnap, workerSnap] = await Promise.all([
          db.collection(COLLECTIONS.USERS).doc(firebaseUser.uid).get(),
          db.collection(COLLECTIONS.WORKERS).doc(firebaseUser.uid).get(),
        ]);

        if (userSnap.exists) {
          const data = userSnap.data()!;
          setUserProfile({
            uid: firebaseUser.uid,
            userNumber: data.userNumber || '',
            name: data.name || '',
            phone: data.phone || firebaseUser.phoneNumber || '',
            email: data.email,
            status: data.status || 'ACTIVE',
            hasWorkerProfile: data.hasWorkerProfile || false,
            activeMode: data.activeMode || 'customer',
          });
        } else {
          // New user — profile will be created in consent screen
          setUserProfile(null);
        }

        if (workerSnap.exists) {
          const wd = workerSnap.data()!;
          // Only load if not deleted
          if (wd.verificationStatus !== 'DELETED' && wd.status !== 'DELETED') {
            setWorkerProfile({
              uid: firebaseUser.uid,
              workerNumber: wd.workerNumber || '',
              name: wd.name || '',
              category: wd.category || '',
              skills: wd.skills || [],
              hourlyRate: wd.hourlyRate || 0,
              experience: wd.experience || '',
              verificationStatus: wd.verificationStatus || 'PENDING',
              isOnline: wd.isOnline || false,
              stats: wd.stats || { completedJobs: 0, averageRating: 0, ratingCount: 0 },
              adminNotes: wd.adminNotes,
            });
          } else {
            setWorkerProfile(null);
          }
        } else {
          setWorkerProfile(null);
        }
      } catch (err) {
        console.error('[useAuth] Error loading profiles:', err);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    });

    return unsubscribe;
  }, []);

  return { uid, userProfile, workerProfile, isLoading, isAuthChecked };
}
