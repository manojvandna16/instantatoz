/**
 * src/store/authStore.ts
 * Zustand store for authentication and user/worker profiles
 */
import { create } from 'zustand';

export interface UserProfile {
  uid: string;
  userNumber: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  address?: string;
  status: 'ACTIVE' | 'DELETED';
  hasWorkerProfile: boolean;
  activeMode: 'customer' | 'worker';
  createdAt?: unknown;
}

export interface WorkerProfile {
  uid: string;
  workerNumber: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  category: string;
  skills: string[];
  hourlyRate: number;
  experience: string;
  resumeText?: string;
  bio?: string;
  verificationStatus: string;
  isOnline: boolean;
  stats: {
    completedJobs: number;
    averageRating: number;
    ratingCount: number;
    totalEarnings?: number;
  };
  adminNotes?: string;
  joinedAt?: unknown;
}

interface AuthState {
  uid: string | null;
  userProfile: UserProfile | null;
  workerProfile: WorkerProfile | null;
  isLoading: boolean;
  isAuthChecked: boolean; // true after first Firebase auth state check

  // Actions
  setUid: (uid: string | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setWorkerProfile: (profile: WorkerProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthChecked: (checked: boolean) => void;
  clearAll: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  userProfile: null,
  workerProfile: null,
  isLoading: true,
  isAuthChecked: false,

  setUid: (uid) => set({ uid }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setWorkerProfile: (profile) => set({ workerProfile: profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setAuthChecked: (checked) => set({ isAuthChecked: checked }),

  clearAll: () =>
    set({
      uid: null,
      userProfile: null,
      workerProfile: null,
      isLoading: false,
      isAuthChecked: true,
    }),
}));
