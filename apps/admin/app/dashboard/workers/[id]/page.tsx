'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { CheckCircle, XCircle, Clock, MapPin, Briefcase, Phone, User, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function WorkerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchWorker() {
      try {
        const db = getFirebaseDb();
        const docRef = doc(db, 'workers', params.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setWorker({ id: snapshot.id, ...snapshot.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorker();
  }, [params.id]);

  const handleVerify = async (status: 'ACTIVE' | 'REJECTED' | 'MORE_INFO_REQUIRED') => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/workers/${params.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to verify worker');
      }

      // Update local state
      setWorker({ ...worker, verificationStatus: status, adminNotes: notes });
      setNotes('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return <div className="text-gray-400">Worker not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/workers" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Worker Details</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              {worker.profilePhoto ? (
                <img src={worker.profilePhoto} alt={worker.name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-700" />
              ) : (
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
              )}
              <h2 className="mt-4 text-lg font-bold text-white">{worker.name}</h2>
              <p className="text-blue-400 font-mono text-sm">{worker.workerNumber}</p>
              <p className="text-gray-400 mt-1">{worker.phone}</p>
              {worker.email && <p className="text-gray-500 text-sm">{worker.email}</p>}
              
              <div className="mt-4 flex gap-2">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  worker.verificationStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  worker.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {worker.verificationStatus || 'PENDING'}
                </span>
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 text-xs font-medium rounded-full">
                  {worker.status || 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Verification Action */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-400" /> Professional Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {worker.skills?.map((s: string) => (
                    <span key={s} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-white">{worker.experience} Years</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" /> Location Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-white">{worker.registeredLocation?.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">District</p>
                <p className="text-white">{worker.registeredLocation?.district}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tehsil</p>
                <p className="text-white">{worker.registeredLocation?.tehsil}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Village/Locality</p>
                <p className="text-white">{worker.registeredLocation?.village}</p>
              </div>
            </div>
          </div>

          {/* Verification Panel */}
          {worker.verificationStatus === 'PENDING' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-3">Admin Verification</h3>
              <p className="text-sm text-gray-400">
                Please verify the worker's original documents offline before activating their profile.
              </p>
              
              <textarea 
                placeholder="Add verification notes (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                rows={3}
              />
              
              <div className="flex gap-3">
                <button 
                  disabled={verifying}
                  onClick={() => handleVerify('ACTIVE')}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Verify & Activate
                </button>
                <button 
                  disabled={verifying}
                  onClick={() => handleVerify('REJECTED')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          )}

          {worker.adminNotes && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Notes</h3>
              <p className="text-white text-sm">{worker.adminNotes}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
