'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { FileText, Search, Eye, X, Clock, CheckCircle2, XCircle, MapPin, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface JobRequest {
  id: string;
  userName: string;
  userPhone: string;
  userId: string;
  category: string;
  status: string;
  location?: { district?: string; city?: string; state?: string; address?: string };
  requestedWorkers: number;
  expectedHours: number;
  estimatedAmount: number;
  finalAmount?: number;
  createdAt: any;
  completedAt?: any;
  cancelledAt?: any;
  cancelReason?: string;
}

const STATUS_STYLES: Record<string, string> = {
  SEARCHING: 'bg-amber-500/20 text-amber-400',
  ACCEPTED: 'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-indigo-500/20 text-indigo-400',
  WORKER_ARRIVING: 'bg-blue-600/20 text-blue-300',
  WORKER_ARRIVED: 'bg-purple-500/20 text-purple-400',
  OTP_VERIFIED: 'bg-purple-600/20 text-purple-300',
  COMPLETED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  BROADCASTING: 'bg-amber-500/20 text-amber-400',
  DISPUTED: 'bg-orange-500/20 text-orange-400',
  REFUNDED: 'bg-pink-500/20 text-pink-400',
};

export default function JobRequestsPage() {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<JobRequest | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as JobRequest)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const searchOk = !q || j.userName?.toLowerCase().includes(q) || j.userPhone?.includes(q) || j.category?.toLowerCase().includes(q) || j.id.includes(q);
    const statusOk = statusFilter === 'ALL' || j.status === statusFilter;
    return searchOk && statusOk;
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayJobs = jobs.filter(j => {
    const d = j.createdAt?.toDate?.() ?? (j.createdAt?.seconds ? new Date(j.createdAt.seconds * 1000) : null);
    return d && d >= today;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Job Requests</h1>
          <p className="text-sm text-gray-400 mt-0.5">{jobs.length} total · {todayJobs.length} today</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: jobs.length, color: 'text-white' },
          { label: 'Active', value: jobs.filter(j => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(j.status)).length, color: 'text-blue-400' },
          { label: 'Completed', value: jobs.filter(j => j.status === 'COMPLETED').length, color: 'text-green-400' },
          { label: 'Cancelled', value: jobs.filter(j => j.status === 'CANCELLED').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, category, job ID..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Statuses</option>
          {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                {['Customer', 'Category', 'Location', 'Workers', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No job requests found.</td></tr>
              ) : filtered.map(job => (
                <tr key={job.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{job.userName || '—'}</p>
                    <p className="text-gray-500 text-xs">{job.userPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">{job.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location?.district || job.location?.city || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">{job.requestedWorkers}</td>
                  <td className="px-4 py-3 text-gray-300 font-medium whitespace-nowrap">
                    ₹{(job.finalAmount || job.estimatedAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[job.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {job.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(job.createdAt, false)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(job)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
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
            Showing {filtered.length} of {jobs.length} requests
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Job Request Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <span className={`inline-block mb-4 text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selected.status] || 'bg-gray-500/20 text-gray-400'}`}>
                {selected.status?.replace(/_/g, ' ')}
              </span>

              <DSection title="Customer">
                <DRow label="Name" value={selected.userName} />
                <DRow label="Phone" value={selected.userPhone} />
                <DRow label="User ID" value={selected.userId} mono />
              </DSection>

              <DSection title="Job Details">
                <DRow label="Job ID" value={selected.id} mono />
                <DRow label="Category" value={selected.category} />
                <DRow label="Workers" value={String(selected.requestedWorkers)} />
                <DRow label="Duration" value={`${selected.expectedHours} hours`} />
                <DRow label="Estimated" value={`₹${(selected.estimatedAmount || 0).toLocaleString('en-IN')}`} />
                {selected.finalAmount && <DRow label="Final Amount" value={`₹${selected.finalAmount.toLocaleString('en-IN')}`} />}
              </DSection>

              <DSection title="Location">
                <DRow label="District" value={selected.location?.district || '—'} />
                <DRow label="City" value={selected.location?.city || '—'} />
                <DRow label="State" value={selected.location?.state || '—'} />
                {selected.location?.address && <DRow label="Address" value={selected.location.address} />}
              </DSection>

              <DSection title="Timeline">
                <DRow label="Created" value={formatDate(selected.createdAt)} />
                {selected.completedAt && <DRow label="Completed" value={formatDate(selected.completedAt)} />}
                {selected.cancelledAt && <DRow label="Cancelled" value={formatDate(selected.cancelledAt)} />}
                {selected.cancelReason && <DRow label="Cancel Reason" value={selected.cancelReason} />}
              </DSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}

function DRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value || '—'}</span>
    </div>
  );
}
