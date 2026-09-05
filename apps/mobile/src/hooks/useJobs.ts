import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { COLLECTIONS, JOB_STATUS } from '../constants';
import { Job, listenCustomerJobs, listenWorkerJobs } from '../services/job.service';
import { useAuthStore } from '../store/authStore';

export const useCustomerJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { uid } = useAuthStore();

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenCustomerJobs(uid, (fetchedJobs: Job[]) => {
      setJobs(fetchedJobs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  return { jobs, loading, error };
};

export const useWorkerJobs = () => {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { uid, workerProfile } = useAuthStore();

  useEffect(() => {
    if (!uid || !workerProfile) {
      setLoading(false);
      return;
    }

    const unsubscribeAssigned = listenWorkerJobs(uid, (jobs: Job[]) => {
      const active = jobs.find((j: Job) => 
        j.status !== JOB_STATUS.COMPLETED && 
        j.status !== JOB_STATUS.CANCELLED && 
        j.status !== JOB_STATUS.DISPUTED
      );
      setActiveJob(active || null);
    });

    // Subscribe to pending jobs in their category (simplified for now)
    const unsubscribePending = db.collection(COLLECTIONS.JOBS)
      .where('status', '==', JOB_STATUS.CREATED)
      //.where('category', '==', workerProfile.category) // Assume worker profile has category later
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const pJobs = snapshot.docs.map(doc => doc.data() as Job);
          setPendingJobs(pJobs);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching pending jobs:', err);
          setError('Failed to load pending jobs');
        }
      );

    return () => {
      unsubscribeAssigned();
      unsubscribePending();
    };
  }, [uid, workerProfile]);

  return { pendingJobs, activeJob, loading, error };
};

export const useJobDetail = (jobId: string | string[] | undefined) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || Array.isArray(jobId)) {
      setLoading(false);
      return;
    }

    const unsubscribe = db.collection(COLLECTIONS.JOBS).doc(jobId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setJob(doc.data() as Job);
          } else {
            setError('Job not found');
          }
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching job detail:', err);
          setError('Failed to load job details');
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [jobId]);

  return { job, loading, error };
};
