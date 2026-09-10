'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Scale, Search, Eye, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth-context';

interface Dispute {
  id: string;
  jobId?: string;
  customerId?: string;
  customerName?: string;
  workerId?: string;
  workerName?: string;
  raisedBy?: string;
  reason?: string;
  description?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_CUSTOMER' | 'RESOLVED_WORKER' | 'RESOLVED_SPLIT' | 'CLOSED';
  resolution?: string;
  refundAmount?: number;
  createdAt: any;
  resolvedAt?: any;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-red-500/20 text-red-400',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-400',
  RESOLVED_CUSTOMER: 'bg-green-500/20 text-green-400',
  RESOLVED_WORKER: 'bg-purple-500/20 text-purple-400',
  RESOLVED_SPLIT: 'bg-teal-500/20 text-teal-400',
  CLOSED: 'bg-gray-500/20 text-gray-400',
};

export default function DisputesPage() {
  const { adminUser } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [updating, setUpdating] = useState(false);
  const [resolution, setResolution] = useState('');
  const [refundAmt, setRefundAmt] = useState('');

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setDisputes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Dispute)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  async function resolveDispute(id: string, outcome: string) {
    if (!resolution.trim()) { alert('Please enter a resolution note'); return; }
    setUpdating(true);
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'disputes', id), {
        status: outcome,
        resolution: resolution.trim(),
        refundAmount: refundAmt ? parseFloat(refundAmt) : null,
        resolvedAt: new Date(),
        resolvedBy: adminUser?.email || adminUser?.uid,
      });
      setSelected(null);
      setResolution('');
      setRefundAmt('');
    } catch { alert('Failed to update dispute'); }
    finally { setUpdating(false); }
  }

  const filtered = disputes.filter(d => {
    const q = search.toLowerCase();
    const searchOk = !q || d.customerName?.toLowerCase().includes(q) || d.workerName?.toLowerCase().includes(q) || d.reason?.toLowerCase().includes(q);
    const statusOk = statusFilter === 'ALL' || d.status === statusFilter;
    return searchOk && statusOk;
  });

  const openCount = disputes.filter(d => ['OPEN', 'UNDER_REVIEW'].includes(d.status)).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Disputes</h1>
        <p className="text-sm text-gray-400 mt-0.5">{disputes.length} total · {openCount} open</p>
      </div>

      {openCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-300"><strong>{openCount}</strong> open dispute{openCount > 1 ? 's' : ''} require resolution.</p>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('ALL')} className={`text-xs px-3 py-1.5 rounded-full ${statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          All ({disputes.length})
        </button>
        {Object.entries(STATUS_STYLES).map(([s, style]) => (
          <button key={s} onClick={() => setStatusFilter(f => f === s ? 'ALL' : s)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${statusFilter === s ? style.replace('/20', '/40') : 'bg-gray-800 text-gray-400'}`}>
            {s.replace(/_/g, ' ')} ({disputes.filter(d => d.status === s).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer, worker, reason..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                {['Customer', 'Worker', 'Reason', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(3)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No disputes found.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white">{d.customerName || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{d.workerName || '—'}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">{d.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[d.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(d.createdAt, false)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(d); setResolution(d.resolution || ''); setRefundAmt(''); }}
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

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-lg bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Dispute Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <span className={`inline-block mb-5 text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selected.status] || ''}`}>
                {selected.status.replace(/_/g, ' ')}
              </span>

              <DSection title="Parties">
                <DRow label="Customer" value={selected.customerName || '—'} />
                <DRow label="Worker" value={selected.workerName || '—'} />
                <DRow label="Raised By" value={selected.raisedBy || '—'} />
                {selected.jobId && <DRow label="Job ID" value={selected.jobId} mono />}
              </DSection>

              <DSection title="Dispute">
                <DRow label="Reason" value={selected.reason || '—'} />
                {selected.description && (
                  <div className="px-4 py-3 text-gray-300 text-sm leading-relaxed">{selected.description}</div>
                )}
              </DSection>

              <DSection title="Timeline">
                <DRow label="Filed" value={formatDate(selected.createdAt)} />
                {selected.resolvedAt && <DRow label="Resolved" value={formatDate(selected.resolvedAt)} />}
              </DSection>

              {selected.resolution && (
                <DSection title="Resolution">
                  <div className="px-4 py-3 text-green-400 text-sm">{selected.resolution}</div>
                  {selected.refundAmount && <DRow label="Refund Amount" value={`₹${selected.refundAmount}`} />}
                </DSection>
              )}

              {/* Actions */}
              {['OPEN', 'UNDER_REVIEW'].includes(selected.status) && (
                <div className="border border-gray-800 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-300">Resolve Dispute</p>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Resolution Note *</label>
                    <textarea value={resolution} onChange={e => setResolution(e.target.value)}
                      rows={3} placeholder="Explain the resolution decision..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Refund Amount (₹) — optional</label>
                    <input type="number" value={refundAmt} onChange={e => setRefundAmt(e.target.value)}
                      placeholder="0" min="0"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => resolveDispute(selected.id, 'RESOLVED_CUSTOMER')} disabled={updating}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs disabled:opacity-50">
                      Favor Customer
                    </button>
                    <button onClick={() => resolveDispute(selected.id, 'RESOLVED_WORKER')} disabled={updating}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs disabled:opacity-50">
                      Favor Worker
                    </button>
                    <button onClick={() => resolveDispute(selected.id, 'RESOLVED_SPLIT')} disabled={updating}
                      className="bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-xs disabled:opacity-50">
                      Split Decision
                    </button>
                  </div>

                  {selected.status === 'OPEN' && (
                    <button onClick={() => updateDoc(doc(getFirebaseDb(), 'disputes', selected.id), { status: 'UNDER_REVIEW' }).then(() => setSelected(null))}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg text-sm">
                      Mark Under Review
                    </button>
                  )}
                </div>
              )}
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
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value}</span>
    </div>
  );
}
