'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { History, Search, Eye, X, Shield } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface AuditLog {
  id: string;
  adminId: string;
  adminRole?: string;
  action: string;
  targetId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string;
  timestamp: any;
}

const ACTION_STYLES: Record<string, string> = {
  COMMISSION_UPDATED: 'bg-purple-500/20 text-purple-400',
  PAYOUT_APPROVED: 'bg-blue-500/20 text-blue-400',
  PAYOUT_PAID: 'bg-green-500/20 text-green-400',
  PAYOUT_FAILED: 'bg-red-500/20 text-red-400',
  PAYOUT_PENDING: 'bg-amber-500/20 text-amber-400',
  PAYOUT_PROCESSING: 'bg-indigo-500/20 text-indigo-400',
  REFUND_INITIATED: 'bg-orange-500/20 text-orange-400',
  WORKER_VERIFIED: 'bg-green-500/20 text-green-400',
  WORKER_REJECTED: 'bg-red-500/20 text-red-400',
  WORKER_SUSPENDED: 'bg-red-600/20 text-red-300',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selected, setSelected] = useState<AuditLog | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const actions = [...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const searchOk = !q || l.adminId.includes(q) || l.action.toLowerCase().includes(q) || l.targetId?.includes(q);
    const actionOk = actionFilter === 'ALL' || l.action === actionFilter;
    return searchOk && actionOk;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-gray-400 mt-0.5">Complete record of all admin actions on the platform.</p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-xs text-gray-400">Audit logs are read-only and automatically generated. They cannot be deleted or modified.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search admin ID, action, target..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                {['Timestamp', 'Action', 'Admin', 'Role', 'Target', 'Reason', 'Detail'].map(h => (
                  <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No audit logs found.</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${ACTION_STYLES[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.adminId.slice(0, 12)}...</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{log.adminRole || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate">{log.targetId || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">{log.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(log)} className="text-xs text-blue-400 hover:text-blue-300 underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            {filtered.length} of {logs.length} audit entries
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-lg bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Audit Log Detail</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <span className={`inline-block mb-5 text-xs px-3 py-1 rounded-full font-medium ${ACTION_STYLES[selected.action] || 'bg-gray-500/20 text-gray-400'}`}>
                {selected.action.replace(/_/g, ' ')}
              </span>

              <ASection title="Event">
                <ARow label="Log ID" value={selected.id} mono />
                <ARow label="Timestamp" value={formatDate(selected.timestamp)} />
                <ARow label="Action" value={selected.action} />
                <ARow label="Target ID" value={selected.targetId || '—'} mono />
                {selected.reason && <ARow label="Reason" value={selected.reason} />}
              </ASection>

              <ASection title="Performed By">
                <ARow label="Admin ID" value={selected.adminId} mono />
                <ARow label="Role" value={selected.adminRole || '—'} />
              </ASection>

              {selected.oldValue && (
                <ASection title="Previous Value">
                  <div className="px-4 py-3">
                    <pre className="text-xs text-gray-400 bg-gray-800 rounded-lg p-3 overflow-x-auto">
                      {JSON.stringify(selected.oldValue, null, 2)}
                    </pre>
                  </div>
                </ASection>
              )}

              {selected.newValue && (
                <ASection title="New Value">
                  <div className="px-4 py-3">
                    <pre className="text-xs text-green-400 bg-gray-800 rounded-lg p-3 overflow-x-auto">
                      {JSON.stringify(selected.newValue, null, 2)}
                    </pre>
                  </div>
                </ASection>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ASection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}
function ARow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value}</span>
    </div>
  );
}
