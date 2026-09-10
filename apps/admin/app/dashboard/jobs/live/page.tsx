'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Zap, MapPin, Clock, Eye, RefreshCw, X, Phone, User, Briefcase, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

const JOB_STATUS_STYLES: Record<string, string> = {
  SEARCHING: 'bg-amber-500/20 text-amber-400',
  ACCEPTED: 'bg-blue-500/20 text-blue-400',
  WORKER_ARRIVING: 'bg-blue-600/20 text-blue-300',
  WORKER_ARRIVED: 'bg-purple-500/20 text-purple-400',
  OTP_VERIFIED: 'bg-purple-600/20 text-purple-300',
  IN_PROGRESS: 'bg-indigo-500/20 text-indigo-400',
  BROADCASTING: 'bg-amber-500/20 text-amber-400',
};

interface LiveJob {
  id: string;
  userName: string;
  userPhone: string;
  category: string;
  status: string;
  location?: { district?: string; city?: string; state?: string; address?: string };
  requestedWorkers: number;
  expectedHours: number;
  estimatedAmount: number;
  finalAmount?: number;
  createdAt: any;
  acceptedAt?: any;
  startedAt?: any;
  assignedWorkers?: string[];
}

export default function LiveJobsPage() {
  const [jobs, setJobs] = useState<LiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LiveJob | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const activeStatuses = ['BROADCASTING', 'SEARCHING', 'ACCEPTED', 'WORKER_ARRIVING', 'WORKER_ARRIVED', 'OTP_VERIFIED', 'IN_PROGRESS'];
    const q = query(
      collection(db, 'jobs'),
      where('status', 'in', activeStatuses),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as LiveJob)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Live Jobs</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {jobs.length} active job{jobs.length !== 1 ? 's' : ''} right now
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-green-400" style={{ animationDuration: '3s' }} />
          <span className="text-green-400">Live</span>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(JOB_STATUS_STYLES).map(([status, style]) => {
          const count = jobs.filter(j => j.status === status).length;
          if (!count) return null;
          return (
            <span key={status} className={`text-xs px-3 py-1.5 rounded-full font-medium ${style}`}>
              {count} {status.replace(/_/g, ' ')}
            </span>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">Loading live jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
          <Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold">No Active Jobs</p>
          <p className="text-gray-500 text-sm mt-1">All jobs are completed or there are no active jobs right now.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition-colors cursor-pointer"
              onClick={() => setSelected(job)}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_STATUS_STYLES[job.status] || 'bg-gray-500/20 text-gray-400'}`}>
                  {job.status.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-1 text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs">Live</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-white font-semibold text-sm">{job.userName}</p>
                <p className="text-gray-500 text-xs">{job.userPhone}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <Briefcase className="w-3 h-3" />
                <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-xs">{job.category}</span>
                <span>·</span>
                <span>{job.requestedWorkers} worker{job.requestedWorkers > 1 ? 's' : ''}</span>
                <span>·</span>
                <span>{job.expectedHours}h</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <MapPin className="w-3 h-3" />
                <span>{job.location?.district || job.location?.city || 'Location not specified'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">
                  ₹{(job.finalAmount || job.estimatedAmount || 0).toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(job.createdAt, false)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Job Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-5 ${JOB_STATUS_STYLES[selected.status] || 'bg-gray-500/20 text-gray-400'}`}>
                <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                {selected.status.replace(/_/g, ' ')}
              </div>

              <InfoSection title="Customer">
                <InfoRow label="Name" value={selected.userName} />
                <InfoRow label="Phone" value={selected.userPhone} />
              </InfoSection>

              <InfoSection title="Job Info">
                <InfoRow label="Job ID" value={selected.id} mono />
                <InfoRow label="Category" value={selected.category} />
                <InfoRow label="Workers Needed" value={String(selected.requestedWorkers)} />
                <InfoRow label="Expected Hours" value={`${selected.expectedHours}h`} />
                <InfoRow label="Estimated Amount" value={`₹${(selected.estimatedAmount || 0).toLocaleString('en-IN')}`} />
                {selected.finalAmount && <InfoRow label="Final Amount" value={`₹${selected.finalAmount.toLocaleString('en-IN')}`} />}
              </InfoSection>

              <InfoSection title="Location">
                <InfoRow label="District" value={selected.location?.district || '—'} />
                <InfoRow label="City" value={selected.location?.city || '—'} />
                <InfoRow label="State" value={selected.location?.state || '—'} />
                {selected.location?.address && <InfoRow label="Address" value={selected.location.address} />}
              </InfoSection>

              <InfoSection title="Timeline">
                <InfoRow label="Created" value={formatDate(selected.createdAt)} />
                {selected.acceptedAt && <InfoRow label="Accepted" value={formatDate(selected.acceptedAt)} />}
                {selected.startedAt && <InfoRow label="Started" value={formatDate(selected.startedAt)} />}
              </InfoSection>

              {selected.assignedWorkers && selected.assignedWorkers.length > 0 && (
                <InfoSection title="Assigned Workers">
                  {selected.assignedWorkers.map((wId, i) => (
                    <InfoRow key={i} label={`Worker ${i + 1}`} value={wId} mono />
                  ))}
                </InfoSection>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value || '—'}</span>
    </div>
  );
}
