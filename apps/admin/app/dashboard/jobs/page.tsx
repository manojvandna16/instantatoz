'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase'; const db = getFirebaseDb();
import { Search, Eye, MapPin } from 'lucide-react';
import type { Job } from '@/types';
import { clsx } from 'clsx';

const JOB_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gray-500/20 text-gray-400',
  SEARCHING: 'bg-amber-500/20 text-amber-400',
  ACCEPTED: 'bg-blue-500/20 text-blue-400',
  WORKER_ARRIVING: 'bg-blue-600/20 text-blue-300',
  WORKER_ARRIVED: 'bg-purple-500/20 text-purple-400',
  OTP_VERIFIED: 'bg-purple-600/20 text-purple-300',
  IN_PROGRESS: 'bg-indigo-500/20 text-indigo-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  DISPUTED: 'bg-orange-500/20 text-orange-400',
  REFUNDED: 'bg-pink-500/20 text-pink-400',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch = !search ||
      j.id.includes(search) ||
      j.userName?.toLowerCase().includes(search.toLowerCase()) ||
      j.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = jobs.filter(j => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(j.status)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Jobs</h1>
          <p className="text-sm text-gray-400 mt-0.5">{jobs.length} total · {activeCount} active</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {['SEARCHING', 'IN_PROGRESS', 'DISPUTED'].map(s => (
            <span key={s} className={clsx('px-2.5 py-1 rounded-full', JOB_STATUS_STYLES[s])}>
              {jobs.filter(j => j.status === s).length} {s.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search job ID, customer, category..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Status</option>
          {Object.keys(JOB_STATUS_STYLES).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Job ID', 'Customer', 'Category', 'Location', 'Workers', 'Hours', 'Amount', 'Status', 'Created', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500">No jobs found.</td>
                </tr>
              ) : filtered.map(job => (
                <tr key={job.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{job.id.slice(0, 10)}...</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-sm">{job.userName}</p>
                    <p className="text-xs text-gray-500">{job.userPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">{job.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location?.district || job.location?.city || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">{job.requestedWorkers}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{job.expectedHours}h</td>
                  <td className="px-4 py-3 text-gray-300 font-medium whitespace-nowrap">
                    ₹{(job.finalAmount || job.estimatedAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap', JOB_STATUS_STYLES[job.status] || 'bg-gray-500/20 text-gray-400')}>
                      {job.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            Showing {filtered.length} of {jobs.length} jobs
          </div>
        )}
      </div>
    </div>
  );
}
