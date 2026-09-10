'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Phone, Search, Eye, X, Mail, Clock } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface ContactForm {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  source?: string;
  status?: string;
  createdAt: any;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactForm | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'contact_forms'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactForm)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || c.subject?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Contact Forms</h1>
        <p className="text-sm text-gray-400 mt-0.5">{contacts.length} submissions from website contact form</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, subject..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                {['Name', 'Contact', 'Subject', 'Source', 'Date', 'View'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  {loading ? 'Loading...' : 'No contact form submissions yet.'}
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                        {c.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-white font-medium">{c.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-300 text-xs">{c.email}</p>
                    {c.phone && <p className="text-gray-500 text-xs">{c.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[180px] truncate">{c.subject || '—'}</td>
                  <td className="px-4 py-3">
                    {c.source && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{c.source}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(c.createdAt, false)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(c)} className="text-xs text-blue-400 hover:text-blue-300 underline">View</button>
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
                <h2 className="text-lg font-bold text-white">Contact Submission</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5 divide-y divide-gray-800">
                <div className="pb-3">
                  <p className="text-xs text-gray-500 mb-1">From</p>
                  <p className="text-white font-semibold">{selected.name}</p>
                  <p className="text-gray-400 text-sm">{selected.email}</p>
                  {selected.phone && <p className="text-gray-400 text-sm">{selected.phone}</p>}
                </div>
                {selected.subject && (
                  <div className="py-3">
                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                    <p className="text-gray-300 font-medium">{selected.subject}</p>
                  </div>
                )}
                <div className="pt-3">
                  <p className="text-xs text-gray-500 mb-2">Message</p>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message || 'No message'}</p>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                <Clock className="w-3 h-3" />
                Submitted {formatDate(selected.createdAt)}
                {selected.source && <> · via {selected.source}</>}
              </div>

              {selected.email && (
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Inquiry'}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm transition-colors">
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
