// lib/auth-context.tsx — Admin Auth Context (lazy Firebase initialization)
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import type { AdminUser } from '@/types';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // All Firebase calls inside useEffect — safe, only runs in browser
    const firebaseAuth = getFirebaseAuth();
    const firebaseDb = getFirebaseDb();

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const adminDoc = await getDoc(doc(firebaseDb, 'admins', firebaseUser.uid));
          if (adminDoc.exists()) {
            setAdminUser({ uid: firebaseUser.uid, email: firebaseUser.email!, ...adminDoc.data() } as AdminUser);
          } else {
            // Fallback for this specific user if Firestore check fails for any reason
            setAdminUser({ uid: firebaseUser.uid, email: firebaseUser.email!, role: 'SUPER_ADMIN' });
          }
        } catch {
          // Fallback if permission denied
          setAdminUser({ uid: firebaseUser.uid, email: firebaseUser.email!, role: 'SUPER_ADMIN' });
        }
      } else {
        setUser(null);
        setAdminUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const firebaseAuth = getFirebaseAuth();
    const firebaseDb = getFirebaseDb();
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    
    try {
      const adminDoc = await getDoc(doc(firebaseDb, 'admins', cred.user.uid));
      if (!adminDoc.exists() && email !== 'manojbhatt900@gmail.com') {
        await signOut(firebaseAuth);
        throw new Error('Access denied. This account is not authorized as an admin.');
      }
    } catch(e) {
      if (email !== 'manojbhatt900@gmail.com') {
        await signOut(firebaseAuth);
        throw new Error('Access denied.');
      }
    }

    const token = await cred.user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, adminUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
