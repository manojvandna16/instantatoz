// lib/auth-context.tsx — Admin Auth Context (lazy Firebase initialization)
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
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
    const firebaseAuth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;
          if (claims.admin === true) {
            const role = (claims.role as AdminUser['role']) || 'SUPER_ADMIN';
            setAdminUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role,
              name: firebaseUser.displayName || 'Admin',
              createdAt: new Date().toISOString(),
              active: true,
            });
          } else {
            setAdminUser(null);
          }
        } catch {
          setAdminUser(null);
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
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    await cred.user.getIdTokenResult(true);
    const idTokenResult = await cred.user.getIdTokenResult();
    const claims = idTokenResult.claims;
    if (claims.admin !== true) {
      await signOut(firebaseAuth);
      throw new Error('Access denied. This account is not authorized as an admin.');
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
