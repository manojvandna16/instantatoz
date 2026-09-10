'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { MessageSquareWarning, Search, Eye, X, CheckCircle2, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth-context';

interface Complaint {
  id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  jobId?: string;
  workerId?: string;
  workerName?: string;
  subject?: string;
  description?: string;
  status: 'NEW' | 'ASSIGNED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  resolution?: string;
  createdAt: any;
  resolvedAt?: any;
  assignedTo?: string;
}

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-red-500/20 text-red-400',
  ASSIGNED: 'bg-amber-500/20 text-amber-400',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-gray-500/20 text-gray-400',
};

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: 'bg-red-600/30 text-red-300',
  HIGH: 'bg-orange-500/20 text-orange-400',
  MEDIUM: 'bg-amber-500/20 text-amber-400',
  LOW: 'bg-gray-500/20 text-gray-400',
};

export default function ComplaintsPage() {
  const { adminUser } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [updating, setUpdating] = useState(false);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(true);
    try {
      const db = getFirebaseDb();
      const update: Record<string, any> = { status: newStatus };
      if (newStatus === 'RESOLVED' && resolution) update.resolution = resolution;
      if (newStatus === 'RESOLVED') update.resolvedAt = new Date();
      if (newStatus === 'ASSIGNED') update.assignedTo = adminUser?.email || adminUser?.uid;
      await updateDoc(doc(db, 'complaints', id), update);
      setSelected(null);
      setResolution('');
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    const searchOk = !q || c.userName?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q) || c.id.includes(q);
    const statusOk = statusFilter === 'ALL' || c.status === statusFilter;
    return searchOk && statusOk;
  });

  const openCount = complaints.filter(c => ['NEW', 'ASSIGNED', 'UNDER_REVIEW'].includes(c.status)).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Complaints</h1>
        <p className="text-sm text-gray-400 mt-0.5">{complaints.length} total · {openCount} open</p>
      </div>

      {openCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300"><strong>{openCount}</strong> complaint{openCount > 1 ? 's' : ''} need attention.</p>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <button key={status} onClick={() => setStatusFilter(s => s === status ? 'ALL' : status)}
            className={`border rounded-xl p-3 text-center transition-all ${statusFilter === status ? 'border-blue-500' : 'border-gray-800'}`}>
            <p className={`text-lg font-bold ${style.split(' ')[1]}`}>{complaints.filter(c => c.status === status).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{status.replace(/_/g, ' ')}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, subject..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Status</option>
          {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                {['User', 'Subject', 'Priority', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No complaints found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{c.userName || 'Unknown'}</p>
                    <p className="text-gray-500 text-xs">{c.userPhone || '—'}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-gray-300 truncate">{c.subject || 'No subject'}</p>
                    {c.jobId && <p className="text-xs text-gray-500 font-mono">Job: {c.jobId.slice(0, 8)}...</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[c.priority] || 'bg-gray-500/20 text-gray-400'}`}>{c.priority}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(c.createdAt, false)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(c); setResolution(c.resolution || ''); }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail + Action Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-lg bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Complaint Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex gap-2 mb-5">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selected.status] || ''}`}>{selected.status.replace(/_/g, ' ')}</span>
                {selected.priority && <span className={`text-xs px-3 py-1 rounded-full font-medium ${PRIORITY_STYLES[selected.priority] || ''}`}>{selected.priority}</span>}
              </div>

              <DS title="Subject">
                <div className="px-4 py-3 text-gray-300 text-sm">{selected.subject || 'No subject provided'}</div>
              </DS>

              <DS title="Description">
                <div className="px-4 py-3 text-gray-300 text-sm leading-relaxed">{selected.description || 'No description provided'}</div>
              </DS>

              <DS title="Customer">
                <DR label="Name" value={selected.userName || '—'} />
                <DR label="Phone" value={selected.userPhone || '—'} />
                {selected.jobId && <DR label="Job ID" value={selected.jobId} mono />}
                {selected.workerName && <DR label="Worker" value={selected.workerName} />}
              </DS>

              <DS title="Timeline">
                <DR label="Filed" value={formatDate(selected.createdAt)} />
                {selected.resolvedAt && <DR label="Resolved" value={formatDate(selected.resolvedAt)} />}
                {selected.assignedTo && <DR label="Assigned To" value={selected.assignedTo} />}
              </DS>

              {selected.resolution && (
                <DS title="Resolution">
                  <div className="px-4 py-3 text-green-400 text-sm">{selected.resolution}</div>
                </DS>
              )}

              {/* Actions */}
              {!['RESOLVED', 'CLOSED'].includes(selected.status) && (
                <div className="border border-gray-800 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-300">Update Status</p>
                  {(selected.status === 'UNDER_REVIEW' || selected.status === 'ASSIGNED') && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Resolution Note</label>
                      <textarea value={resolution} onChange={e => setResolution(e.target.value)}
                        rows={2} placeholder="Describe the resolution..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selected.status === 'NEW' && (
                      <button onClick={() => updateStatus(selected.id, 'ASSIGNED')} disabled={updating}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                        Assign to Me
                      </button>
                    )}
                    {['ASSIGNED', 'NEW'].includes(selected.status) && (
                      <button onClick={() => updateStatus(selected.id, 'UNDER_REVIEW')} disabled={updating}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                        Mark Under Review
                      </button>
                    )}
                    {['UNDER_REVIEW', 'ASSIGNED'].includes(selected.status) && (
                      <button onClick={() => updateStatus(selected.id, 'RESOLVED')} disabled={updating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                        Mark Resolved
                      </button>
                    )}
                    <button onClick={() => updateStatus(selected.id, 'CLOSED')} disabled={updating}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DS({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}
function DR({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value}</span>
    </div>
  );
}
