'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase'; const db = getFirebaseDb();
import { Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, Eye, UserCheck, UserX, Ban } from 'lucide-react';
import type { Worker } from '@/types';
import { clsx } from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  ONLINE: 'bg-green-500/20 text-green-400 border-green-500/30',
  AVAILABLE: 'bg-green-500/20 text-green-400 border-green-500/30',
  OFFLINE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  BUSY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ON_JOB: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/30',
  BLOCKED: 'bg-red-700/20 text-red-500 border-red-700/30',
  UNKNOWN: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
};

const VERIFICATION_STYLES: Record<string, string> = {
  APPROVED: 'bg-green-500/20 text-green-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  NEEDS_MORE_INFO: 'bg-orange-500/20 text-orange-400',
  SUSPENDED: 'bg-red-700/20 text-red-500',
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterVerification, setFilterVerification] = useState('ALL');

  useEffect(() => {
    const q = query(collection(db, 'workers'), orderBy('joinedAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setWorkers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as Worker)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = workers.filter(w => {
    const matchSearch = !search ||
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.phone?.includes(search) ||
      w.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || w.status === filterStatus;
    const matchVerification = filterVerification === 'ALL' || w.verificationStatus === filterVerification;
    return matchSearch && matchStatus && matchVerification;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Workers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{workers.length} total workers registered</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">{workers.filter(w => w.status === 'ONLINE' || w.status === 'AVAILABLE').length} Online</span>
          <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full">{workers.filter(w => w.verificationStatus === 'PENDING').length} Pending</span>
          <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full">{workers.filter(w => w.status === 'SUSPENDED').length} Suspended</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, category..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Status</option>
          {['ONLINE', 'AVAILABLE', 'OFFLINE', 'BUSY', 'ON_JOB', 'SUSPENDED', 'BLOCKED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filterVerification} onChange={e => setFilterVerification(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Verification</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_MORE_INFO', 'SUSPENDED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                {['Worker', 'Phone', 'Category', 'Location', 'Status', 'Verification', 'Rating', 'Jobs', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    No workers found matching your filters.
                  </td>
                </tr>
              ) : filtered.map(worker => (
                <tr key={worker.uid} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {worker.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{worker.name || '—'}</p>
                        <p className="text-xs text-gray-500">{worker.uid.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{worker.phone}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">{worker.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {worker.registeredLocation?.district || worker.registeredLocation?.city || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-1 rounded-full border font-medium', STATUS_STYLES[worker.status] || STATUS_STYLES.UNKNOWN)}>
                      {worker.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', VERIFICATION_STYLES[worker.verificationStatus] || 'bg-gray-500/20 text-gray-400')}>
                      {worker.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yellow-400 font-medium">
                    {worker.rating > 0 ? `★ ${worker.rating.toFixed(1)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{worker.totalJobs ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="View" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {worker.verificationStatus === 'PENDING' && (
                        <button title="Approve" className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors">
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {worker.status !== 'SUSPENDED' && (
                        <button title="Suspend" className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            Showing {filtered.length} of {workers.length} workers
          </div>
        )}
      </div>
    </div>
  );
}
