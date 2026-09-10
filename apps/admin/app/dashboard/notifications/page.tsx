'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Bell, Search, Eye, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface Notification {
  id: string;
  userId?: string;
  title?: string;
  body?: string;
  type?: string;
  read?: boolean;
  createdAt: any;
  data?: Record<string, any>;
}

const TYPE_STYLES: Record<string, string> = {
  JOB_ACCEPTED: 'bg-blue-500/20 text-blue-400',
  JOB_COMPLETED: 'bg-green-500/20 text-green-400',
  JOB_CANCELLED: 'bg-red-500/20 text-red-400',
  PAYMENT_RECEIVED: 'bg-emerald-500/20 text-emerald-400',
  WORKER_ARRIVING: 'bg-purple-500/20 text-purple-400',
  SYSTEM: 'bg-gray-500/20 text-gray-400',
  PROMOTION: 'bg-amber-500/20 text-amber-400',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selected, setSelected] = useState<Notification | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const types = [...new Set(notifs.map(n => n.type).filter(Boolean))];

  const filtered = notifs.filter(n => {
    const q = search.toLowerCase();
    const searchOk = !q || n.title?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q) || n.userId?.includes(q);
    const typeOk = typeFilter === 'ALL' || n.type === typeFilter;
    return searchOk && typeOk;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-gray-400 mt-0.5">{notifs.length} total · {unreadCount} unread</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Sent</p>
          <p className="text-2xl font-bold text-white">{notifs.length}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Unread</p>
          <p className="text-2xl font-bold text-blue-400">{unreadCount}</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Read</p>
          <p className="text-2xl font-bold text-green-400">{notifs.length - unreadCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, body, user ID..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Types</option>
          {types.map(t => <option key={t} value={t!}>{t!.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                {['Title', 'Body', 'Type', 'Read', 'Date', 'Detail'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No notifications found.</td></tr>
              ) : filtered.map(n => (
                <tr key={n.id} className={`hover:bg-gray-800/30 transition-colors ${!n.read ? 'bg-blue-500/3' : ''}`}>
                  <td className="px-4 py-3">
                    <p className={`font-medium text-sm ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title || '—'}</p>
                    {!n.read && <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">New</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate text-xs">{n.body || '—'}</td>
                  <td className="px-4 py-3">
                    {n.type && <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[n.type] || 'bg-gray-500/20 text-gray-400'}`}>{n.type.replace(/_/g, ' ')}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {n.read ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-blue-400" />}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(n.createdAt, false)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(n)} className="text-xs text-blue-400 hover:text-blue-300 underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
            {filtered.length} of {notifs.length} notifications
          </div>
        )}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Notification</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5">
                {selected.type && <span className={`text-xs px-2 py-0.5 rounded-full mb-3 inline-block ${TYPE_STYLES[selected.type] || 'bg-gray-500/20 text-gray-400'}`}>{selected.type.replace(/_/g, ' ')}</span>}
                <p className="text-white font-semibold text-base mt-2">{selected.title || 'No title'}</p>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">{selected.body || 'No body'}</p>
              </div>

              <NSection title="Info">
                <NRow label="Notification ID" value={selected.id} mono />
                <NRow label="User ID" value={selected.userId || '—'} mono />
                <NRow label="Read" value={selected.read ? 'Yes' : 'No'} />
                <NRow label="Sent" value={formatDate(selected.createdAt)} />
              </NSection>

              {selected.data && Object.keys(selected.data).length > 0 && (
                <NSection title="Payload Data">
                  {Object.entries(selected.data).map(([k, v]) => (
                    <NRow key={k} label={k} value={String(v)} />
                  ))}
                </NSection>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}
function NRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value}</span>
    </div>
  );
}
