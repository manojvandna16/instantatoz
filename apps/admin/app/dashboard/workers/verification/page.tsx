'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase'; const db = getFirebaseDb();
import { Clock, CheckCircle, XCircle, Info, AlertTriangle, Eye } from 'lucide-react';
import type { Worker } from '@/types';
import { clsx } from 'clsx';

export default function WorkerVerificationPage() {
  const [pending, setPending] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'workers'),
      where('verificationStatus', '==', 'PENDING'),
      orderBy('joinedAt', 'asc') // oldest first
    );
    const unsub = onSnapshot(q, snap => {
      setPending(snap.docs.map(d => ({ uid: d.id, ...d.data() } as Worker)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Worker Verification</h1>
          <p className="text-sm text-gray-400 mt-0.5">Review and verify worker applications</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {pending.length} Pending
          </span>
        </div>
      </div>

      {pending.length === 0 && !loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-white font-medium">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending worker verifications.</p>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          ))
        ) : pending.map(worker => (
          <div key={worker.uid} className="bg-gray-900 border border-amber-800/30 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-600/20 border border-amber-600/30 rounded-full flex items-center justify-center text-sm font-bold text-amber-400 flex-shrink-0">
                  {worker.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-white">{worker.name}</p>
                  <p className="text-sm text-gray-400">{worker.phone} · {worker.category}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                      📍 {worker.registeredLocation?.district || worker.registeredLocation?.city || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                      🗓 Joined {worker.joinedAt ? new Date(worker.joinedAt).toLocaleDateString('en-IN') : '—'}
                    </span>
                    {worker.experience && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                        💼 {worker.experience}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View Docs
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium rounded-lg transition-colors border border-blue-600/30">
                  <Info className="w-3.5 h-3.5" /> Need Info
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-600/30">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-green-600/20">
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
              </div>
            </div>

            {/* Documents */}
            {worker.documents && worker.documents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2 font-medium">Documents ({worker.documents.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {worker.documents.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                      📄 {doc.type}
                      {doc.verified && <CheckCircle className="w-3 h-3 text-green-400" />}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
