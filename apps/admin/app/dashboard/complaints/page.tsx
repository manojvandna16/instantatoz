'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase'; const db = getFirebaseDb();
import { MessageSquareWarning, Eye, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import type { Complaint } from '@/types';
import { clsx } from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-red-500/20 text-red-400 border-red-500/30',
  ASSIGNED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  UNDER_REVIEW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  AWAITING_USER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  AWAITING_WORKER: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  RESOLVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ESCALATED: 'bg-red-700/20 text-red-500 border-red-700/30',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = filterStatus === 'ALL' ? complaints : complaints.filter(c => c.status === filterStatus);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Complaints</h1>
          <p className="text-sm text-gray-400 mt-0.5">{complaints.length} total complaints</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {['NEW', 'UNDER_REVIEW', 'ESCALATED'].map(s => (
            <span key={s} className={clsx('px-2.5 py-1 rounded-full border', STATUS_STYLES[s])}>
              {complaints.filter(c => c.status === s).length} {s.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Status</option>
          {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-white font-medium">No complaints</p>
            <p className="text-gray-400 text-sm mt-1">No complaints match the current filter.</p>
          </div>
        ) : filtered.map(complaint => (
          <div key={complaint.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-9 h-9 bg-orange-600/20 border border-orange-600/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquareWarning className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white text-sm">{complaint.type}</p>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', STATUS_STYLES[complaint.status])}>
                      {complaint.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{complaint.description || 'No description provided.'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                    {complaint.jobId && <span>Job: {complaint.jobId.slice(0, 8)}...</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                {complaint.status === 'NEW' && (
                  <button className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-600/30">
                    Assign
                  </button>
                )}
                {['ASSIGNED', 'UNDER_REVIEW'].includes(complaint.status) && (
                  <button className="text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-1.5 rounded-lg transition-colors border border-green-600/30">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
