'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase'; const db = getFirebaseDb();
import { Search, Users as UsersIcon, Eye } from 'lucide-react';

interface UserRecord {
  uid: string;
  name?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  totalJobs?: number;
  location?: { district?: string; city?: string; state?: string };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserRecord)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} registered customers</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Phone', 'Email', 'Location', 'Jobs Posted', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.uid} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-600/20 border border-blue-600/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                        {user.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-white font-medium text-sm">{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{user.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{user.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{user.location?.district || user.location?.city || '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-300">{user.totalJobs ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '—'}
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
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
