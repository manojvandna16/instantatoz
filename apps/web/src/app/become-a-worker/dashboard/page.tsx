'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Power, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { geohashForLocation } from 'geofire-common';

export default function WorkerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastLocation, setLastLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login?redirect=/become-a-worker/dashboard');
      return;
    }

    async function fetchWorker() {
      try {
        const workerDoc = await getDoc(doc(db, 'workers', user!.uid));
        if (!workerDoc.exists()) {
          router.push('/become-a-worker/register');
          return;
        }
        
        const data = workerDoc.data();
        if (data.verificationStatus !== 'ACTIVE') {
          router.push('/become-a-worker/status');
          return;
        }
        
        setWorker(data);
        
        // If they were already online, restart tracking
        if (data.isOnline) {
          startTracking();
        }
        
      } catch (err: any) {
        setError('Failed to load worker dashboard.');
      } finally {
        setLoading(false);
      }
    }

    fetchWorker();

    return () => {
      // Cleanup location watcher on unmount
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user, authLoading, router]);

  const updateLocationInDb = async (lat: number, lng: number) => {
    if (!user) return;
    try {
      const geohash = geohashForLocation([lat, lng]);
      await updateDoc(doc(db, 'workers', user.uid), {
        'liveLocation': {
          lat,
          lng,
          lastUpdated: serverTimestamp()
        },
        'geohash': geohash,
      });
      setLastLocation({lat, lng});
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        updateLocationInDb(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError('Failed to get location: ' + err.message);
        // Force offline if we can't track them
        handleToggleOnline(false); 
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const handleToggleOnline = async (forceState?: boolean) => {
    if (!user || !worker) return;
    setIsUpdating(true);
    setError('');

    const newState = forceState !== undefined ? forceState : !worker.isOnline;

    try {
      await updateDoc(doc(db, 'workers', user.uid), {
        isOnline: newState
      });
      
      setWorker({ ...worker, isOnline: newState });

      if (newState) {
        startTracking();
      } else {
        stopTracking();
      }
    } catch (err: any) {
      setError('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-plus-jakarta mb-2">Worker Dashboard</h1>
          <p className="text-gray-500 font-mono text-sm mb-8">{worker?.workerNumber}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-8">
            <button
              onClick={() => handleToggleOnline()}
              disabled={isUpdating}
              className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 shadow-xl ${
                worker?.isOnline 
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-200' 
                  : 'bg-gray-400 hover:bg-gray-500 shadow-gray-200'
              } ${isUpdating ? 'opacity-80 scale-95' : 'hover:scale-105'}`}
            >
              {isUpdating ? (
                <Loader2 className="w-16 h-16 animate-spin" />
              ) : (
                <>
                  <Power className="w-16 h-16 mb-2" />
                  <span className="text-xl font-bold font-plus-jakarta">
                    {worker?.isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                  </span>
                </>
              )}
            </button>
            <p className={`mt-6 font-medium ${worker?.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              You are currently {worker?.isOnline ? 'ONLINE and visible to customers' : 'OFFLINE'}
            </p>
          </div>

          {worker?.isOnline && lastLocation && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-full max-w-xs mx-auto">
              <MapPin className="w-4 h-4 text-blue-600" />
              GPS tracking active
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{worker?.completedJobs || worker?.stats?.completedJobs || 0}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Jobs</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{Number(worker?.averageRating || worker?.stats?.averageRating || 0).toFixed(1)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Rating</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">₹0</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Earned</p>
          </div>
        </div>

      </div>
    </div>
  );
}
