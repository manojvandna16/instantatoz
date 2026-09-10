'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { HeadphonesIcon, Search, Eye, X, Clock, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface SupportTicket {
  id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  subject?: string;
  description?: string;
  category?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: string;
  createdAt: any;
  resolvedAt?: any;
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-red-500/20 text-red-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  RESOLVED: 'bg-green-500/20 text-green-400',
  CLOSED: 'bg-gray-500/20 text-gray-400',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const searchOk = !q || t.userName?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q) || t.id.includes(q);
    const statusOk = statusFilter === 'ALL' || t.status === statusFilter;
    return searchOk && statusOk;
  });

  const openCount = tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Support Tickets</h1>
        <p className="text-sm text-gray-400 mt-0.5">{tickets.length} total · {openCount} open</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS_STYLES).map(([status, style]) => (
          <div key={status} className={`border rounded-xl p-4 ${style.includes('red') ? 'bg-red-500/5 border-red-500/20' : style.includes('blue') ? 'bg-blue-500/5 border-blue-500/20' : style.includes('green') ? 'bg-green-500/5 border-green-500/20' : 'bg-gray-900 border-gray-800'}`}>
            <p className={`text-2xl font-bold ${style.split(' ')[1]}`}>{tickets.filter(t => t.status === status).length}</p>
            <p className="text-xs text-gray-500 mt-1">{status.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, subject..."
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
                {['User', 'Subject', 'Category', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <HeadphonesIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No support tickets found</p>
                </td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{t.userName || 'Unknown'}</p>
                    {t.userPhone && <p className="text-gray-500 text-xs">{t.userPhone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[180px] truncate">{t.subject || '—'}</td>
                  <td className="px-4 py-3">
                    {t.category && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{t.category}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[t.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(t.createdAt, false)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(t)} className="text-xs text-blue-400 hover:text-blue-300 underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Support Ticket</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <span className={`inline-block mb-4 text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selected.status] || ''}`}>
                {selected.status.replace(/_/g, ' ')}
              </span>

              <SSection title="Ticket">
                <SRow label="ID" value={selected.id} mono />
                <SRow label="Subject" value={selected.subject || '—'} />
                {selected.category && <SRow label="Category" value={selected.category} />}
                {selected.priority && <SRow label="Priority" value={selected.priority} />}
                <SRow label="Submitted" value={formatDate(selected.createdAt)} />
                {selected.resolvedAt && <SRow label="Resolved" value={formatDate(selected.resolvedAt)} />}
              </SSection>

              <SSection title="User">
                <SRow label="Name" value={selected.userName || '—'} />
                <SRow label="Phone" value={selected.userPhone || '—'} />
                <SRow label="User ID" value={selected.userId || '—'} mono />
              </SSection>

              {selected.description && (
                <SSection title="Description">
                  <div className="px-4 py-3 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.description}
                  </div>
                </SSection>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}
function SRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value}</span>
    </div>
  );
}
