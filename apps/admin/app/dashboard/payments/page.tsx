'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Search, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import type { Payment } from '@/types';
import { clsx } from 'clsx';

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  CREATED: 'bg-gray-500/20 text-gray-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  AUTHORIZED: 'bg-blue-500/20 text-blue-400',
  CAPTURED: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-red-600/20 text-red-500',
  REFUNDED: 'bg-pink-500/20 text-pink-400',
  PARTIALLY_REFUNDED: 'bg-orange-500/20 text-orange-400',
  DISPUTED: 'bg-orange-600/20 text-orange-500',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.id.includes(search) || p.gatewayTransactionId?.includes(search);
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'CAPTURED').reduce((s, p) => s + p.grossAmount, 0);
  const totalCommission = payments.filter(p => p.status === 'CAPTURED').reduce((s, p) => s + p.platformCommission, 0);
  const totalRefunded = payments.filter(p => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status)).reduce((s, p) => s + (p.refundAmount || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Payments</h1>
        <p className="text-sm text-gray-400 mt-0.5">{payments.length} transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-green-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">{payments.filter(p => p.status === 'CAPTURED').length} successful payments</p>
        </div>
        <div className="bg-gray-900 border border-blue-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Platform Commission</p>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">₹{totalCommission.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">Net platform earnings</p>
        </div>
        <div className="bg-gray-900 border border-red-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Total Refunded</p>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">₹{totalRefunded.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">{payments.filter(p => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status)).length} refunds</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search payment ID, transaction ID..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Status</option>
          {Object.keys(PAYMENT_STATUS_STYLES).map(s => (
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
                {['Payment ID', 'Job ID', 'Amount', 'Commission', 'Worker Payable', 'Gateway', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No payments found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.id.slice(0, 10)}...</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.jobId?.slice(0, 10)}...</td>
                  <td className="px-4 py-3 font-semibold text-white">₹{p.grossAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-blue-400">₹{p.platformCommission?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-green-400">₹{p.workerPayable?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.gatewayName}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', PAYMENT_STATUS_STYLES[p.status] || 'bg-gray-500/20 text-gray-400')}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
