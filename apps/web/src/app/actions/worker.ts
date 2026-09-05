'use server';

import { adminDb } from '@/lib/firebase-admin';

export interface PublicWorkerProfile {
  id: string;
  name: string;
  profilePhoto: string | null;
  skills: string[];
  experience: string;
  status: string;
  isOnline: boolean;
  stats: {
    completedJobs: number;
    averageRating: number;
    ratingCount: number;
  };
  workerNumber: string;
}

export async function getPublicWorkerProfile(workerId: string): Promise<PublicWorkerProfile | null> {
  try {
    const workerDoc = await adminDb().collection('workers').doc(workerId).get();
    
    if (!workerDoc.exists) return null;
    
    const data = workerDoc.data();
    if (!data) return null;
    
    // Check if worker is approved and active before showing public profile
    if (data.verificationStatus !== 'APPROVED') {
      return null;
    }

    return {
      id: workerDoc.id,
      name: data.name,
      profilePhoto: data.profilePhoto || null,
      skills: data.skills || [],
      experience: data.experience || 'New',
      status: data.status || 'OFFLINE',
      isOnline: data.isOnline || false,
      stats: {
        completedJobs: data.completedJobs || data.stats?.completedJobs || 0,
        averageRating: data.averageRating || data.stats?.averageRating || 0,
        ratingCount: data.ratingCount || data.stats?.ratingCount || 0,
      },
      workerNumber: data.workerNumber,
    };
  } catch (error) {
    console.error('Error fetching public worker profile:', error);
    return null;
  }
}
